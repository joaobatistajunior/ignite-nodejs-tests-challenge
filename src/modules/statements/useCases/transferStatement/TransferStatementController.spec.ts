
import { hash } from "bcryptjs";
import { Connection, createConnection } from "typeorm";
import { v4 as uuidV4 } from "uuid";
import request from "supertest"
import { app } from "../../../../app";

let connection: Connection;

const sender_id = uuidV4();
const beneficiary_id = uuidV4();

describe("Transfer statement Controller", () => {

  beforeAll(async () => {

    connection = await createConnection();
    await connection.runMigrations();

    const password = await hash("test", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES ('${sender_id}', 'sender_user', 'sender_user@email.com', '${password}', 'now()', 'now()')`
    );
    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      VALUES ('${beneficiary_id}', 'beneficiary_user', 'beneficiary_user@email.com', '${password}', 'now()', 'now()')`
    );

    await connection.close;
  });


  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to transfer statement", async () => {

    const senderReponseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "sender_user@email.com",
        password: "test"
      });

    const { token: sender_token } = senderReponseToken.body;

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 500,
        description: "deposit test"
      })
      .set({
        Authorization: `Bearer ${sender_token}`,
      });

    await request(app)
      .post(`/api/v1/statements/transfers/${beneficiary_id}`)
      .send({
        amount: 200,
        description: "transfer test"
      })
      .set({
        Authorization: `Bearer ${sender_token}`,
      });


    const sender_balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${sender_token}`,
      });

    expect(sender_balance.status).toBe(200);
    expect(sender_balance.body.balance).toBe(300);
    expect(sender_balance.body.statement).toHaveLength(2);
    expect(sender_balance.body.statement[0]).not.toHaveProperty("sender_id");
    expect(sender_balance.body.statement[1]).toHaveProperty("sender_id");


    const beneficiaryResponseToken = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "beneficiary_user@email.com",
        password: "test"
      });

    const { token: beneficiary_token } = beneficiaryResponseToken.body;

    const beneficiary_balance = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${beneficiary_token}`,
      });

    expect(beneficiary_balance.status).toBe(200);
    expect(beneficiary_balance.body.balance).toBe(200);
    expect(beneficiary_balance.body.statement).toHaveLength(1);
    expect(beneficiary_balance.body.statement[0]).toHaveProperty("sender_id");


  });

  it("should not be able to transfer statement for a non-existent user", async () => {
    const response = await request(app)
      .post(`/api/v1/statements/transfers/${beneficiary_id}`)
      .send({
        amount: 200,
        description: "transfer test"
      })
      .set({
        Authorization: `Bearer invalid token`,
      });

    expect(response.status).toBe(401);
  });

})
