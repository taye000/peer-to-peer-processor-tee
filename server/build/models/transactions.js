"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITransactionStatus = void 0;
const mongoose_1 = require("mongoose");
var ITransactionStatus;
(function (ITransactionStatus) {
    ITransactionStatus["SUCCESS"] = "success";
    ITransactionStatus["PENDING"] = "pending";
    ITransactionStatus["FAILED"] = "failed";
})(ITransactionStatus = exports.ITransactionStatus || (exports.ITransactionStatus = {}));
const TransactionSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    assigned: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: mongoose_1.Schema.Types.Mixed,
        default: ITransactionStatus.PENDING,
    },
}, {
    toJSON: {
        virtuals: true,
        transform(_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
        versionKey: false,
    },
    timestamps: true,
});
//static method to build a user
TransactionSchema.statics.build = (attrs) => {
    return new Transaction(attrs);
};
//create a transaction model
const Transaction = (0, mongoose_1.model)("Transactions", TransactionSchema);
exports.default = Transaction;
