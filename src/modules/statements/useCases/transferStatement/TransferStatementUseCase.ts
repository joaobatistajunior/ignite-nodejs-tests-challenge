import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { OperationType } from "../../enums/OperationType";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { TransferStatementError } from "./TransferStatementError";

interface IRequest {
  sender_id: string;
  beneficiary_id: string;
  amount: number;
  description: string;
}

@injectable()
class TransferStatementUseCase {

  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) { }

  async execute({ sender_id, beneficiary_id, amount, description }: IRequest): Promise<Statement> {

    const sender_user = this.usersRepository.findById(sender_id);
    if (!sender_user) {
      throw new TransferStatementError.UserNotFound();
    }

    const beneficiary = this.usersRepository.findById(beneficiary_id);
    if (!beneficiary) {
      throw new TransferStatementError.UserNotFound();
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });
    if (balance < amount) {
      throw new TransferStatementError.InsufficientFunds()
    }

    return this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: beneficiary_id,
      sender_id
    });


  }
}

export { TransferStatementUseCase };

