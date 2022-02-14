import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { Statement } from "../../entities/Statement";
import { OperationType } from "../../enums/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user_id: string;

describe("Get Statement Operation", () => {

  beforeEach(async() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    const user = await usersRepositoryInMemory.create({
      email: "user_balance@email.com",
      name: "user name balance",
      password: "123456"
    });

    user_id = user.id as string;
  });

  it("should be able to get a statement", async () => {
    const newDeposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit test"
    };
    const statement = await statementsRepositoryInMemory.create(newDeposit);
    const statement_id = statement.id as string;
    const result = await getStatementOperationUseCase.execute({user_id,statement_id});

    expect(result).toBeInstanceOf(Statement);
    expect(result).toHaveProperty("id");
    expect(result.id).toEqual(statement_id);
    expect(result).toHaveProperty("user_id");
    expect(result).toHaveProperty("type");
    expect(result).toHaveProperty("amount");
    expect(result).toHaveProperty("description");
  });

  it("should not be able to get a statement with a non-existent user", () => {
    expect(async() => {
      const newDeposit: ICreateStatementDTO = {
        user_id,
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "deposit test"
      };
      const statement = await statementsRepositoryInMemory.create(newDeposit);
      const statement_id = statement.id as string;
      await getStatementOperationUseCase.execute({user_id: "invalid_user_id_get_statement",statement_id});
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });

  it("should not be able to get a statement with a non-existent statement", () => {
    expect(async() => {
      await getStatementOperationUseCase.execute({user_id, statement_id: "invalid_statement_id"});
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });


})
