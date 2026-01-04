import express from "express";
import {
  getAllClients,
  getClientTransactions,
} from "../controllers/admin.users.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/clients", getAllClients);
router.get("/clients/:clientId/transactions", getClientTransactions);

export default router;
