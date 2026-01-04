import express from "express";
import {
  getPendingTransactions,
  updateTransactionStatus,
  getAllTransactions,
} from "../controllers/admin.transactions.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/transactions/pending", getPendingTransactions);
router.get("/transactions", getAllTransactions);
router.put("/transactions/:transactionId/status", updateTransactionStatus);

export default router;
