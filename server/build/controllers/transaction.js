"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionTxHash = exports.updateTransactionStatus = exports.updateTransactionAssigned = exports.getUserTransaction = exports.getUserTransactions = exports.getTransaction = exports.getTransactions = exports.MpesaCallbackURL = exports.createTransactionController = void 0;
const transactions_1 = __importStar(require("../models/transactions"));
const users_1 = __importDefault(require("../models/users"));
const helpers_1 = require("../helpers");
const accountNumber = () => {
    return Math.random().toString(35).substring(2, 7);
};
//controller to create new transaction
const createTransactionController = async (req, res) => {
    let { phone, amount, walletAddress, tokenName } = req.body;
    const user = await users_1.default.findById(req.currentUser.id);
    if (!user) {
        return res.status(401).json({ msg: "Unauthorised access." });
    }
    if (!phone.trim()) {
        return res.status(400).json({ phone: "phone No. is required" });
    }
    if (!amount.trim()) {
        return res.status(400).json({ amount: "amount is required" });
    }
    if (!walletAddress.trim()) {
        return res.status(400).json({ walletAddress: "walletAddress is required" });
    }
    if (!tokenName.trim()) {
        return res.status(400).json({ tokenName: "tokenName is required" });
    }
    try {
        let message = "";
        const mpesaWrapper = new helpers_1.MpesaWrapper({
            consumerKey: process.env.MPESA_CONSUMER_KEY,
            consumerSecret: process.env.MPESA_SECRET_KEY,
            shortCode: process.env.MPESA_SHORT_CODE,
            initiatorName: process.env.MPESA_INITIATOR_NAME,
            lipaNaMpesaShortCode: process.env.MPESA_LIPA_NA_MPESA_SHORT_CODE,
            lipaNaMpesaShortPass: process.env.MPESA_LIPA_NA_MPESA_SHORT_PASS,
        });
        phone = `254${phone}`;
        const accountNo = accountNumber();
        const callbackUrl = `https://6be1-41-84-159-230.in.ngrok.io/api/transactions/callback-url`;
        const mpesaResponse = await mpesaWrapper.stkPush({
            phone,
            amount,
            accountNumber: accountNo,
            callbackUrl,
        });
        if (mpesaResponse.error) {
            message = mpesaResponse.error;
            return res.status(400).json({ status: false, message });
        }
        else {
            message = "success";
        }
        // create the transactions here
        await transactions_1.default.create({
            phone: mpesaResponse.phone,
            amount: mpesaResponse.amount,
            walletAddress: walletAddress,
            userId: req.currentUser.id,
            tokenName: tokenName,
            checkoutId: mpesaResponse.checkoutId,
            status: transactions_1.ITransactionStatus.PENDING,
        });
        return res.status(201).json({
            status: true,
            message,
            msg: "New STKPush Transaction Initiated Successfully. You will receive a prompt on your phone to complete the transaction.",
            mpesaResponse,
        });
    }
    catch (error) {
        return res
            .status(400)
            .json({ msg: "Error creating transaction", error: error.message });
    }
};
exports.createTransactionController = createTransactionController;
const MpesaCallbackURL = async (req, res) => {
    console.log("Processing callback from Mpesa");
    const mpesaWrapper = new helpers_1.MpesaWrapper({
        consumerKey: process.env.MPESA_CONSUMER_KEY,
        consumerSecret: process.env.MPESA_SECRET_KEY,
        shortCode: process.env.MPESA_SHORT_CODE,
        initiatorName: process.env.MPESA_INITIATOR_NAME,
        lipaNaMpesaShortCode: process.env.MPESA_LIPA_NA_MPESA_SHORT_CODE,
        lipaNaMpesaShortPass: process.env.MPESA_LIPA_NA_MPESA_SHORT_PASS,
    });
    try {
        const response = await mpesaWrapper.receivePayloadFromCallbackUrl(req.body);
        const transaction = await transactions_1.default.findOne({
            checkoutId: response.checkoutId,
        });
        console.log(response);
        if (transaction) {
            transaction.status = transactions_1.ITransactionStatus.SUCCESS;
            await transaction.save();
        }
        console.log("mpesa response", response);
        res.status(200).send({});
    }
    catch (error) {
        console.log("mpesa error", error);
        res.status(200).send({});
    }
};
exports.MpesaCallbackURL = MpesaCallbackURL;
//controller to get all transactions
const getTransactions = async (_req, res) => {
    try {
        const transactions = await transactions_1.default.find();
        res.status(200).json({ transactions });
    }
    catch (error) {
        res.status(404).json({ msg: error.message });
    }
};
exports.getTransactions = getTransactions;
//controller to get a single transaction
const getTransaction = async (id) => {
    try {
        const transaction = await transactions_1.default.findOne(id);
        return transaction;
    }
    catch (error) {
        console.log(error.message);
        return null;
    }
};
exports.getTransaction = getTransaction;
// controller to get transactions of signed-in user
const getUserTransactions = async (req, res) => {
    const userId = req.currentUser?.id;
    try {
        const transactions = await transactions_1.default.find({ userId }); // Retrieve only transactions that belong to the signed-in user
        res.status(200).json({ transactions });
    }
    catch (error) {
        res.status(404).json({ msg: error.message });
    }
};
exports.getUserTransactions = getUserTransactions;
// controller to get a single transaction of signed-in user
const getUserTransaction = async (req, res) => {
    try {
        const userId = req.currentUser?.id; // Assuming you have middleware that adds the signed-in user's ID to the request object
        const transaction = await transactions_1.default.findOne({
            _id: req.params.id,
            userId,
        }); // Retrieve the transaction that matches both the user ID and the transaction ID
        if (!transaction) {
            return res.status(404).json({ msg: "Transaction not found" });
        }
        res.status(200).json({ transaction });
    }
    catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
exports.getUserTransaction = getUserTransaction;
//controller to update a transaction assigned person
const updateTransactionAssigned = async (req, res) => {
    try {
        const user = await users_1.default.findById(req.currentUser?.id);
        if (!user || user.is_admin === false) {
            res.status(401).json({ msg: "Unauthorized access" });
        }
        // Get the transaction id from the request body
        const transaction = await transactions_1.default.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ msg: "transaction not found" });
        }
        let assigned = user;
        await transactions_1.default.findByIdAndUpdate(req.params.id, {
            assigned,
        });
        res
            .status(200)
            .json({ success: true, msg: "Transaction updated successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error updating transaction", error });
    }
};
exports.updateTransactionAssigned = updateTransactionAssigned;
//controller to update a transaction status
const updateTransactionStatus = async (req, res) => {
    try {
        const user = await users_1.default.findById(req.currentUser?.id);
        if (!user) {
            res.status(401).json({ msg: "Unauthorized access" });
        }
        // get the transaction id from the request body
        const transaction = await transactions_1.default.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ msg: "transaction not found" });
        }
        const status = transactions_1.ITransactionStatus.SUCCESS;
        await transactions_1.default.findByIdAndUpdate(req.params.id, {
            status,
        });
        res
            .status(200)
            .json({ success: true, msg: "Transaction updated successfully" });
    }
    catch (error) {
        res.status(500).json({ msg: "Error updating transaction", error });
    }
};
exports.updateTransactionStatus = updateTransactionStatus;
//controller to update a transaction hash
const updateTransactionTxHash = async (req, res) => {
    const { txHash } = req.body;
    try {
        const user = await users_1.default.findById(req.currentUser?.id);
        if (!user) {
            res.status(401).json({ msg: "Unauthorized access" });
        }
        // get the transaction id from the request body
        const transaction = await transactions_1.default.findById(req.params.id);
        if (!transaction) {
            res.status(404).json({ msg: "transaction not found" });
        }
        await transactions_1.default.findByIdAndUpdate(req.params.id, {
            txHash,
        });
        res
            .status(200)
            .json({ success: true, msg: "Transaction updated successfully" });
    }
    catch (error) {
        res.status(500).json({ msg: "Error updating transaction", error });
    }
};
exports.updateTransactionTxHash = updateTransactionTxHash;
