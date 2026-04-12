import express from "express";
import {
  uploadTransactionImage,
  getTransactionImages,
} from "../controllers/transactionImage.controller.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("image"),
  uploadTransactionImage
);
router.get("/:transaction_id", getTransactionImages);

export default router;