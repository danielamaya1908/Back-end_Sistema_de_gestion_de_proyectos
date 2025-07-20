import { Task } from "../models/Task.js";
import { Project } from "../models/Project.js";

export const getDashboardMetricsService = async (userId, userRole) => {
  const baseQuery = { isDeleted: { $ne: true } };

  if (userRole === "developer") {
    baseQuery.assignedTo = userId;
  } else if (userRole === "manager") {
    const managedProjects = await Project.find({ managerId: userId }).distinct(
      "_id"
    );
    baseQuery.projectId = { $in: managedProjects };
  }

  const [
    projectsByStatus,
    tasksByStatus,
    tasksByPriority,
    hoursComparison,
    overdueTasks,
    userTasks,
  ] = await Promise.all([
    getProjectsByStatus(userId, userRole),
    getTasksByStatus(baseQuery),
    getTasksByPriority(baseQuery),
    getHoursComparison(baseQuery),
    getOverdueTasksCount(baseQuery),
    userRole === "developer"
      ? getUserTaskMetrics(userId)
      : Promise.resolve(null),
  ]);

  return {
    projectsByStatus,
    tasksByStatus,
    tasksByPriority,
    hoursComparison,
    overdueTasks,
    userTasks,
  };
};

export const getProjectMetricsService = async (projectId) => {
  const [
    tasksByStatus,
    tasksByPriority,
    hoursComparison,
    overdueTasks,
    teamPerformance,
  ] = await Promise.all([
    Task.aggregate([
      { $match: { projectId, isDeleted: { $ne: true } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } },
    ]),
    Task.aggregate([
      { $match: { projectId, isDeleted: { $ne: true } } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $project: { priority: "$_id", count: 1, _id: 0 } },
    ]),
    Task.aggregate([
      {
        $match: {
          projectId,
          isDeleted: { $ne: true },
          estimatedHours: { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          totalEstimated: { $sum: "$estimatedHours" },
          totalActual: { $sum: "$actualHours" },
        },
      },
    ]),
    Task.countDocuments({
      projectId,
      dueDate: { $lt: new Date() },
      status: { $nin: ["done", "cancelled"] },
      isDeleted: { $ne: true },
    }),
    getTeamPerformanceMetrics(projectId),
  ]);

  return {
    tasksByStatus: formatStatusData(tasksByStatus, "tasks"),
    tasksByPriority: formatPriorityData(tasksByPriority),
    hoursComparison: {
      estimated: hoursComparison[0]?.totalEstimated || 0,
      actual: hoursComparison[0]?.totalActual || 0,
      difference:
        (hoursComparison[0]?.totalEstimated || 0) -
        (hoursComparison[0]?.totalActual || 0),
    },
    overdueTasks,
    teamPerformance,
  };
};

function getProjectsByStatus(userId, userRole) {
  const query = { isDeleted: { $ne: true } };

  if (userRole === "manager") {
    query.managerId = userId;
  } else if (userRole === "developer") {
    query.developersIds = userId;
  }

  return Project.aggregate([
    { $match: query },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);
}

function getTasksByStatus(baseQuery) {
  return Task.aggregate([
    { $match: baseQuery },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);
}

function getTasksByPriority(baseQuery) {
  return Task.aggregate([
    { $match: baseQuery },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
    { $project: { priority: "$_id", count: 1, _id: 0 } },
  ]);
}

function getHoursComparison(baseQuery) {
  return Task.aggregate([
    {
      $match: { ...baseQuery, estimatedHours: { $exists: true } },
    },
    {
      $group: {
        _id: null,
        totalEstimated: { $sum: "$estimatedHours" },
        totalActual: { $sum: "$actualHours" },
      },
    },
  ]);
}

function getOverdueTasksCount(baseQuery) {
  return Task.countDocuments({
    ...baseQuery,
    dueDate: { $lt: new Date(), $ne: null },
    status: { $nin: ["done", "cancelled"] },
  });
}

function getUserTaskMetrics(userId) {
  return Task.aggregate([
    { $match: { assignedTo: userId, isDeleted: { $ne: true } } },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$dueDate", null] },
                  { $nin: ["$status", ["done", "cancelled"]] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);
}

function getTeamPerformanceMetrics(projectId) {
  return Task.aggregate([
    { $match: { projectId, isDeleted: { $ne: true } } },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $group: {
        _id: "$assignedTo",
        name: { $first: "$user.name" },
        avatar: { $first: "$user.avatar" },
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ["$dueDate", new Date()] },
                  { $ne: ["$dueDate", null] },
                  { $nin: ["$status", ["done", "cancelled"]] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        userId: "$_id",
        name: 1,
        avatar: 1,
        totalTasks: 1,
        completedTasks: 1,
        overdueTasks: 1,
        completionRate: {
          $cond: [
            { $eq: ["$totalTasks", 0] },
            0,
            {
              $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100],
            },
          ],
        },
      },
    },
  ]);
}

function formatStatusData(data, type) {
  const defaultStatuses =
    type === "projects"
      ? ["planning", "in_progress", "completed", "cancelled"]
      : ["todo", "in_progress", "review", "done"];

  return defaultStatuses.map((status) => ({
    status,
    count: data.find((item) => item.status === status)?.count || 0,
  }));
}

function formatPriorityData(data) {
  const priorities = ["low", "medium", "high"];

  return priorities.map((priority) => ({
    priority,
    count: data.find((item) => item.priority === priority)?.count || 0,
  }));
}
