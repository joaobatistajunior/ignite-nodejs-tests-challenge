import { Connection, createConnection } from "typeorm"
import request from "supertest";
import { app } from "../../../../app";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcryptjs";

let connection: Connection;
describe("Authenticate User Controller", () => {

  beforeAll(async() => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("user", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES ('${id}', 'user', 'user@email.com', '${password}', 'now()', 'now()')`
  );

  await connection.close;

  });

  afterAll(async() => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async() => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@email.com",
      password: "user"
    });

    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("id");
  });

  it("should not be able to authenticate with a non-exists user", async() => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "invalid.user@email.com",
      password: "user"
    })

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate with a incorrect password", async() => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "user@email.com",
      password: "invalid-user-password"
    })

    expect(response.status).toBe(401);
  });


})
