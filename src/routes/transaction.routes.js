import express from "express";
import {
  createTransaction,
  getUserTransactions,
} from "../controllers/transaction.controller.js";
import { notifyAdminNewRequest } from "../controllers/transaction.notify.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, createTransaction);
router.post("/:transactionId/notify-admin", authMiddleware, notifyAdminNewRequest);
router.get("/", authMiddleware, getUserTransactions);

export default router;
