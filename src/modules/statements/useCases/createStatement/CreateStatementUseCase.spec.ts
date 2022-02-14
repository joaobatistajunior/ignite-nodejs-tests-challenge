import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../enums/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let createStatementUseCase: CreateStatementUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user_id: string;

describe("Create statements", () => {

  beforeEach(async() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    const user = await usersRepositoryInMemory.create({
      email: "user_statement@email.com",
      name: "user name statement",
      password: "123456"
    });

    user_id = user.id as string;
  });

  it("should be able to deposit statement", async() => {
    const newDeposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit test"
    };
    const statement = await createStatementUseCase.execute(newDeposit);
    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(newDeposit.type);
    expect(statement.amount).toEqual(newDeposit.amount);
    expect(statement.description).toEqual(newDeposit.description);
  });


  it("should be able to withdraw statement", async() => {
    const newDeposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit test"
    };
    await createStatementUseCase.execute(newDeposit);

    const newWithdraw: ICreateStatementDTO = {
      user_id,
      type: OperationType.WITHDRAW,
      amount: 1000,
      description: "withdraw test"
    };
    const statement = await createStatementUseCase.execute(newWithdraw);

    expect(statement).toHaveProperty("id");
    expect(statement.type).toEqual(newWithdraw.type);
    expect(statement.amount).toEqual(newWithdraw.amount);
    expect(statement.description).toEqual(newWithdraw.description);
  });

  it("should not be able to create a statement with an non-existent user", () => {
    expect(async() => {
      const newInvalidUserDeposit: ICreateStatementDTO = {
        user_id: "invalid_user_id_statement",
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "deposit test"
      };
      await createStatementUseCase.execute(newInvalidUserDeposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to withdraw if the user had insufficient funds", () => {
    expect(async() => {
      const newWithdrawInsufficientFunds: ICreateStatementDTO = {
        user_id,
        type: OperationType.WITHDRAW,
        amount: 50000,
        description: "withdraw test"
      };
      await createStatementUseCase.execute(newWithdrawInsufficientFunds);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })



})
