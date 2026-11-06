import express from "express";
import {
  getPendingTransactions,
  updateTransactionStatus,
  getAllTransactions,
  getTransactionsWithProof,
} from "../controllers/admin.transactions.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/transactions/pending", getPendingTransactions);
router.get("/transactions", getAllTransactions);
router.get("/transactions-with-proof", getTransactionsWithProof);
router.put("/transactions/:transactionId/status", updateTransactionStatus);
router.patch("/transactions/:transactionId/status", updateTransactionStatus);

export default router;
