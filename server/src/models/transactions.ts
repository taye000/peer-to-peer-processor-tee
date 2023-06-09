import { Schema, model, Model } from "mongoose";
import { ITransaction } from "../@types";

export enum ITransactionStatus {
  SUCCESS = "success",
  PENDING = "pending",
  FAILED = "failed",
}
//an interface that describes attributes the model should have
interface TransactioModel extends Model<ITransaction> {
  build(attrs: ITransaction): ITransaction;
}

const TransactionSchema = new Schema<ITransaction, TransactioModel>(
  {
    phone: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      trim: true,
      required: true,
    },
    walletAddress: {
      type: String,
      trim: true,
      required: true,
    },
    tokenName: {
      type: String,
      trim: true,
      required: true,
      max: 50,
    },
    checkoutId: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      trim: true,
    },
    txHash: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assigned: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Schema.Types.Mixed,
      default: ITransactionStatus.PENDING,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
    timestamps: true,
  }
);

//static method to build a user
TransactionSchema.statics.build = (attrs: ITransaction) => {
  return new Transaction(attrs);
};
//create a transaction model
const Transaction = model<ITransaction>("Transactions", TransactionSchema);

export default Transaction;
