import { Request, Response } from "express";
import Transaction, { ITransactionStatus } from "../models/transactions";
import User from "../models/users";
import { MpesaWrapper } from "../helpers";

const accountNumber = () => {
  return Math.random().toString(35).substring(2, 7);
};

//controller to create new transaction
export const createTransactionController = async (
  req: Request,
  res: Response
) => {
  let { phone, amount, walletAddress, tokenName } = req.body;

  const user = await User.findById(req.currentUser!.id);

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

    const mpesaWrapper = new MpesaWrapper({
      consumerKey: process.env.MPESA_CONSUMER_KEY!,
      consumerSecret: process.env.MPESA_SECRET_KEY!,
      shortCode: process.env.MPESA_SHORT_CODE!,
      initiatorName: process.env.MPESA_INITIATOR_NAME!,
      lipaNaMpesaShortCode: process.env.MPESA_LIPA_NA_MPESA_SHORT_CODE!,
      lipaNaMpesaShortPass: process.env.MPESA_LIPA_NA_MPESA_SHORT_PASS!,
    });

    phone = `254${phone}`;

    const accountNo = accountNumber();

    const callbackUrl = `https://6be1-41-84-159-230.in.ngrok.io/api/transactions/callback-url`;
    const mpesaResponse: any = await mpesaWrapper.stkPush({
      phone,
      amount,
      accountNumber: accountNo,
      callbackUrl,
    });

    if (mpesaResponse.error) {
      message = mpesaResponse.error;
      return res.status(400).json({ status: false, message });
    } else {
      message = "success";
    }
    // create the transactions here

    await Transaction.create({
      phone: mpesaResponse.phone,
      amount: mpesaResponse.amount,
      walletAddress: walletAddress,
      userId: req.currentUser!.id,
      tokenName: tokenName,
      checkoutId: mpesaResponse.checkoutId,
      status: ITransactionStatus.PENDING,
    });
    return res.status(201).json({
      status: true,
      message,
      msg: "New STKPush Transaction Initiated Successfully. You will receive a prompt on your phone to complete the transaction.",
      mpesaResponse,
    });
  } catch (error: any) {
    return res
      .status(400)
      .json({ msg: "Error creating transaction", error: error.message });
  }
};

export const MpesaCallbackURL = async (req: Request, res: Response) => {
  console.log("Processing callback from Mpesa");

  const mpesaWrapper = new MpesaWrapper({
    consumerKey: process.env.MPESA_CONSUMER_KEY!,
    consumerSecret: process.env.MPESA_SECRET_KEY!,
    shortCode: process.env.MPESA_SHORT_CODE!,
    initiatorName: process.env.MPESA_INITIATOR_NAME!,
    lipaNaMpesaShortCode: process.env.MPESA_LIPA_NA_MPESA_SHORT_CODE!,
    lipaNaMpesaShortPass: process.env.MPESA_LIPA_NA_MPESA_SHORT_PASS!,
  });

  try {
    const response: any = await mpesaWrapper.receivePayloadFromCallbackUrl(
      req.body
    );

    const transaction = await Transaction.findOne({
      checkoutId: response.checkoutId,
    });

    console.log(response);
    if (transaction) {
      transaction.status = ITransactionStatus.SUCCESS;
      await transaction.save();
    }

    console.log("mpesa response", response);
    res.status(200).send({});
  } catch (error: any) {
    console.log("mpesa error", error);
    res.status(200).send({});
  }
};

//controller to get all transactions
export const getTransactions = async (_req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find();
    res.status(200).json({ transactions });
  } catch (error: any) {
    res.status(404).json({ msg: error.message });
  }
};

//controller to get a single transaction
export const getTransaction = async (id: any) => {
  try {
    const transaction = await Transaction.findOne(id);
    return transaction;
  } catch (error: any) {
    console.log(error.message);
    return null;
  }
};

// controller to get transactions of signed-in user
export const getUserTransactions = async (req: Request, res: Response) => {
  const userId = req.currentUser?.id;

  try {
    const transactions = await Transaction.find({ userId }); // Retrieve only transactions that belong to the signed-in user
    res.status(200).json({ transactions });
  } catch (error: any) {
    res.status(404).json({ msg: error.message });
  }
};

// controller to get a single transaction of signed-in user
export const getUserTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.currentUser?.id; // Assuming you have middleware that adds the signed-in user's ID to the request object
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    }); // Retrieve the transaction that matches both the user ID and the transaction ID
    if (!transaction) {
      return res.status(404).json({ msg: "Transaction not found" });
    }
    res.status(200).json({ transaction });
  } catch (error: any) {
    res.status(500).json({ msg: error.message });
  }
};

//controller to update a transaction assigned person
export const updateTransactionAssigned = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await User.findById(req.currentUser?.id);
    if (!user || user.is_admin === false) {
      res.status(401).json({ msg: "Unauthorized access" });
    }
    // Get the transaction id from the request body
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ msg: "transaction not found" });
    }

    let assigned = user;

    await Transaction.findByIdAndUpdate(req.params.id, {
      assigned,
    });
    res
      .status(200)
      .json({ success: true, msg: "Transaction updated successfully" });
  } catch (error) {
    console.error(error);

    res.status(500).json({ msg: "Error updating transaction", error });
  }
};

//controller to update a transaction status
export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.currentUser?.id);
    if (!user) {
      res.status(401).json({ msg: "Unauthorized access" });
    }
    // get the transaction id from the request body
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ msg: "transaction not found" });
    }

    const status = ITransactionStatus.SUCCESS;

    await Transaction.findByIdAndUpdate(req.params.id, {
      status,
    });
    res
      .status(200)
      .json({ success: true, msg: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating transaction", error });
  }
};

//controller to update a transaction hash
export const updateTransactionTxHash = async (req: Request, res: Response) => {
  const { txHash } = req.body;
  try {
    const user = await User.findById(req.currentUser?.id);
    if (!user) {
      res.status(401).json({ msg: "Unauthorized access" });
    }
    // get the transaction id from the request body
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      res.status(404).json({ msg: "transaction not found" });
    }

    await Transaction.findByIdAndUpdate(req.params.id, {
      txHash,
    });
    res
      .status(200)
      .json({ success: true, msg: "Transaction updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating transaction", error });
  }
};
