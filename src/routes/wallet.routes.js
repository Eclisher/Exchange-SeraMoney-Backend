import express from "express";
import * as controller from "../controllers/wallet.controller.js";
const router = express.Router();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;