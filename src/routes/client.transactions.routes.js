import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getMyTransactions } from "../controllers/client.transactions.controller.js";

const router = express.Router();

router.get("/me/transactions", authMiddleware, getMyTransactions);

export default router;
