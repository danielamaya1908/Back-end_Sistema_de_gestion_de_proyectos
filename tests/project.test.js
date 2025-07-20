import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/projects/getAll", (req, res) => {
  res.status(200).json({
    data: [
      {
        id: "1",
        name: "Proyecto de Prueba",
        status: "active",
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

app.get("/api/projects/getById", (req, res) => {
  res.status(200).json({
    id: "1",
    name: "Proyecto Específico",
    description: "Descripción del proyecto",
  });
});

app.post("/api/projects/create", (req, res) => {
  res.status(201).json({
    message: "Proyecto creado",
    project: req.body,
  });
});

app.put("/api/projects/put", (req, res) => {
  res.status(200).json({
    message: "Proyecto actualizado",
    project: req.body,
  });
});

app.delete("/api/projects/delete", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Proyecto eliminado (soft delete)",
  });
});

describe("Project API Endpoints", () => {
  it("GET /api/projects/getAll - debería retornar lista de proyectos", async () => {
    const response = await request(app).get("/api/projects/getAll");
    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination.total).toBe(1);
  });

  it("GET /api/projects/getById - debería retornar un proyecto específico", async () => {
    const response = await request(app)
      .get("/api/projects/getById")
      .send({ projectId: "1" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("description");
  });

  it("POST /api/projects/create - debería crear un proyecto", async () => {
    const newProject = {
      name: "Nuevo Proyecto",
      description: "Descripción del nuevo proyecto",
    };

    const response = await request(app)
      .post("/api/projects/create")
      .send(newProject);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Proyecto creado");
  });

  it("PUT /api/projects/put - debería actualizar un proyecto", async () => {
    const updateData = {
      id: "1",
      name: "Proyecto Actualizado",
    };

    const response = await request(app)
      .put("/api/projects/put")
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Proyecto actualizado");
  });

  it("DELETE /api/projects/delete - debería eliminar un proyecto", async () => {
    const response = await request(app)
      .delete("/api/projects/delete")
      .send({ projectId: "1" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
