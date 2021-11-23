import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Statement Operation Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const user_id = uuidV4();
    const password = await hash("user", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES ('${user_id}', 'user', 'user@email.com', '${password}', 'now()', 'now()')`
    );

    await connection.close;

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get a statement operation", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "user"
      });

    const { token } = responseToken.body;

    //deposit
    const depositStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit test"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementId = depositStatement.body.id;

    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer ${token}`,
      });


    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("user_id");
    expect(response.body).toHaveProperty("description");
    expect(response.body).toHaveProperty("amount");
    expect(response.body).toHaveProperty("type");
    expect(response.body).toHaveProperty("created_at");
    expect(response.body).toHaveProperty("updated_at");
    expect(response.body.id).toBe(statementId);
    expect(response.body.type).toBe("deposit");

  });

  it("should not be able to get a statement with a non-existent user", async () => {

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "user"
      });

    const { token } = responseToken.body;

    //deposit
    const depositStatement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit test"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const statementId = depositStatement.body.id;

    //valid statement with invalid token
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .set({
        Authorization: `Bearer InvalidToken`,
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to get a statement with a non-exists statement ", async () => {

    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "user"
      });

    const { token } = responseToken.body;

    //invalid statement with valid token
    const response = await request(app)
      .get(`/api/v1/statements/fake-123-statement-id`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(500);
  })

})
