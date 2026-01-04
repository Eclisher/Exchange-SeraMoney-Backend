import express from "express";
import { getAdminLogs } from "../controllers/admin.logs.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/logs", getAdminLogs);

export default router;
