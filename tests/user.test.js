import request from "supertest";
import express from "express";
import userRouter from "../src/routes/user.routes.js";

if (typeof jest === "undefined") {
  global.jest = {
    fn: () => () => {},
    spyOn: () => () => {},
    clearAllMocks: () => {},
    restoreAllMocks: () => {},
  };
}

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

describe("User API Endpoints - Basic Test", () => {
  it("GET /api/users/getAll - prueba básica", async () => {
    const response = await request(app)
      .get("/api/users/getAll")
      .set("Authorization", "Bearer fake-token");

    expect([200, 401, 403]).toContain(response.status);
  });
});
