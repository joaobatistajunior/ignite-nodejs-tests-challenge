import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({ statement, balance }: { statement: Statement[], balance: number }) {

    const parsedStatement = statement.map(st => {
      if (st.type === 'transfer') {
        return {
          id: st.id,
          sender_id: st.sender_id,
          amount: st.amount,
          description: st.description,
          type: st.type,
          created_at: st.created_at,
          updated_at: st.updated_at
        }
      } else {
        return {
          id: st.id,
          amount: st.amount,
          description: st.description,
          type: st.type,
          created_at: st.created_at,
          updated_at: st.updated_at
        }
      }
    })

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
