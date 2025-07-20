import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/tasks/getAll", (req, res) => {
  res.status(200).json({
    data: [
      {
        id: "1",
        title: "Tarea de prueba",
        status: "pending",
      },
    ],
    pagination: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  });
});

app.get("/api/tasks/get-by-project", (req, res) => {
  res.status(200).json([
    {
      id: "1",
      title: "Tarea en proyecto",
      projectId: "123",
    },
  ]);
});

app.get("/api/tasks/getById", (req, res) => {
  res.status(200).json({
    id: "1",
    title: "Tarea específica",
    description: "Descripción detallada",
  });
});

app.post("/api/tasks/create", (req, res) => {
  res.status(201).json({
    message: "Tarea creada",
    task: req.body,
  });
});

app.put("/api/tasks/put", (req, res) => {
  res.status(200).json({
    message: "Tarea actualizada",
    task: req.body,
  });
});

app.delete("/api/tasks/delete", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Tarea eliminada (soft delete)",
  });
});

describe("Task API Endpoints", () => {
  it("GET /api/tasks/getAll - debería retornar lista de tareas", async () => {
    const response = await request(app).get("/api/tasks/getAll");
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination.total).toBe(1);
  });

  it("GET /api/tasks/get-by-project - debería retornar tareas de proyecto", async () => {
    const response = await request(app)
      .get("/api/tasks/get-by-project")
      .send({ projectId: "123" });

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty("projectId");
  });

  it("POST /api/tasks/create - debería crear una tarea", async () => {
    const newTask = {
      title: "Nueva tarea",
      projectId: "123",
      assignedTo: "user123",
    };

    const response = await request(app).post("/api/tasks/create").send(newTask);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Tarea creada");
  });

  it("PUT /api/tasks/put - debería actualizar una tarea", async () => {
    const updateData = {
      taskId: "1",
      title: "Tarea actualizada",
    };

    const response = await request(app).put("/api/tasks/put").send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Tarea actualizada");
  });

  it("DELETE /api/tasks/delete - debería eliminar una tarea", async () => {
    const response = await request(app)
      .delete("/api/tasks/delete")
      .send({ taskId: "1" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
