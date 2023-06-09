import { Router } from "express";
import { validateRequest, validateToken } from "../../middleware";
import {
  createTransactionController,
  MpesaCallbackURL,
  getUserTransaction,
  getUserTransactions,
} from "../../controllers/transaction";

const router = Router();

router.get(
  "/get-transaction/:id",
  validateRequest,
  validateToken,
  getUserTransaction
);
router.get(
  "/get-transactions",
  validateRequest,
  validateToken,
  getUserTransactions
);

router.post(
  "/create-transaction",
  validateRequest,
  validateToken,
  createTransactionController
);

router.post("/callback-url", MpesaCallbackURL);

module.exports = router;
