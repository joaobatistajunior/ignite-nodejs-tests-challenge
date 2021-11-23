import { hash } from "bcryptjs";
import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Balance Controller", () => {

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

  it("should be able to get balance", async () => {
    const responseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@email.com",
        password: "user"
      });

    const { token } = responseToken.body;

    const initialBalance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });


    expect(initialBalance.status).toBe(200);
    expect(initialBalance.body.statement.length).toBe(0);
    expect(initialBalance.body.balance).toBe(0);

    //deposit
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit test"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    //withdraw
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 300,
        description: "withdraw test"
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(balance.status).toBe(200);
    expect(balance.body.statement.length).toBe(2);
    expect(balance.body.balance).toBe(200);

  });

  it("should not be able to get balance for a non-existent user", async () => {

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer InvalidToken`,
      });

    expect(response.status).toBe(401);

  });

})
