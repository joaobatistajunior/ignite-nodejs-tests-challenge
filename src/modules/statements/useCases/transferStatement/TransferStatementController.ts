import { Request, Response } from "express";
import { container } from "tsyringe";
import { TransferStatementUseCase } from "./TransferStatementUseCase";

class TransferStatementController {

  async execute(request: Request, response: Response): Promise<Response> {
    const {beneficiary_id} = request.params;
    const { id: sender_id } = request.user;
    const {amount, description} = request.body;

    const transferStatementUseCase = container.resolve(TransferStatementUseCase);

    const transferStatement = await transferStatementUseCase.execute({
      sender_id,
      beneficiary_id,
      amount,
      description
    });

    return response.json(transferStatement);
  }
}

export {TransferStatementController}
