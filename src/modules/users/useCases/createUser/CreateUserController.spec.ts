import { Connection, createConnection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
describe("Create User Controller", () => {

  beforeAll(async() => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async() => {
    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "create user test",
      email: "create.user@email.com",
      password: "123456"
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user if already exists", async() => {
    const response = await request(app)
    .post("/api/v1/users")
    .send({
      name: "create user test",
      email: "create.user@email.com",
      password: "123456"
    });

    expect(response.status).toBe(400);
  });

})
