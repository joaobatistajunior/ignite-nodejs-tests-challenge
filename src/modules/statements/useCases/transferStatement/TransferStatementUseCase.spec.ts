import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../enums/OperationType";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { TransferStatementError } from "./TransferStatementError";
import { TransferStatementUseCase } from "./TransferStatementUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;
let transferStatementUseCase: TransferStatementUseCase;
let sender_id: string;
let beneficiary_id: string;

describe("Transfer statement", () => {

  beforeEach(async () => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();
    transferStatementUseCase = new TransferStatementUseCase(usersRepositoryInMemory, statementsRepositoryInMemory);

    const sender_user = await usersRepositoryInMemory.create({
      email: "sender_user@email.com",
      name: "user sender",
      password: "123456"
    });

    const beneficiary_user = await usersRepositoryInMemory.create({
      email: "benecificary_user@email.com",
      name: "user beneficiary",
      password: "123456"
    });

    sender_id = sender_user.id as string;
    beneficiary_id = beneficiary_user.id as string;
  })

  it("should be able to transfer statement", async () => {
    const newDeposit: ICreateStatementDTO = {
      user_id: sender_id,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "deposit sender user"
    };
    await statementsRepositoryInMemory.create(newDeposit);

    await transferStatementUseCase.execute({
      sender_id,
      beneficiary_id,
      amount: 600,
      description: "Transfer from sender user"
    });

    const balance_sender = await statementsRepositoryInMemory.getUserBalance({
      user_id: sender_id
    });
    const balance_beneficiary = await statementsRepositoryInMemory.getUserBalance({
      user_id: beneficiary_id
    });

    expect(balance_sender.balance).toEqual(400);
    expect(balance_beneficiary.balance).toEqual(600);
  });

  it("should not be able to transfer for an non-existent user", () => {

    expect(async () => {
      const newDeposit: ICreateStatementDTO = {
        user_id: sender_id,
        type: OperationType.DEPOSIT,
        amount: 1000,
        description: "deposit sender user"
      };
      await statementsRepositoryInMemory.create(newDeposit);

      transferStatementUseCase.execute({
        sender_id,
        beneficiary_id: "invalid-user",
        amount: 600,
        description: "Transfer from sender user"
      })
    }).rejects.toBeInstanceOf(TransferStatementError.UserNotFound)

  })

  it("should not be able to transfer with insufficient funds", () => {

    expect(async () => {
      const newDeposit: ICreateStatementDTO = {
        user_id: sender_id,
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "deposit sender user"
      };
      await statementsRepositoryInMemory.create(newDeposit);

      transferStatementUseCase.execute({
        sender_id,
        beneficiary_id,
        amount: 1000,
        description: "Transfer from sender user"
      })
    }).rejects.toBeInstanceOf(TransferStatementError.InsufficientFunds)

  })



})
