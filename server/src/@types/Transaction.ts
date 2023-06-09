import { Schema } from "mongoose";

export interface ITransaction {
  id?: string;
  phone?: string;
  userId: Schema.Types.ObjectId;
  amount: number;
  walletAddress: string;
  checkoutId: string;
  accountNumber: string;
  tokenName: string;
  txHash: string;
  assigned?: Schema.Types.ObjectId;
  status?: string;
}
