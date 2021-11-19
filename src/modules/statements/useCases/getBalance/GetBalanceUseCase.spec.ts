import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let getBalanceUseCase: GetBalanceUseCase;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user_id: string;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {

  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepositoryInMemory);

    const user = await usersRepositoryInMemory.create({
      email: "user_balance@email.com",
      name: "user name balance",
      password: "123456"
    });

    user_id = user.id as string;

  });

  it("should be able to get balance for an user", async () => {

    const deposit: ICreateStatementDTO = {
      user_id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit test"
    };
    await statementsRepositoryInMemory.create(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id,
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "withdraw test"
    };
    await statementsRepositoryInMemory.create(withdraw);

    const balance = await getBalanceUseCase.execute({user_id});

    expect(balance.balance).toEqual(500);
    expect(balance.statement.length).toEqual(2);
  });

  it("should not be able to get balance for an non-existent user", () => {
    expect(async() => {
      await getBalanceUseCase.execute({user_id: "invalid_user_id_profile"});
    }).rejects.toBeInstanceOf(GetBalanceError)
  })

})
