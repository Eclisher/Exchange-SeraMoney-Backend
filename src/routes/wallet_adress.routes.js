import express from 'express';
import {
  createWallet,
  getWallets,
  updateWallet,
} from "../controllers/wallet_adress.controller.js";

const router = express.Router();

router.post("/:walletId/addresses", createWallet);
router.get("/:walletId/addresses", getWallets);
router.delete("/:walletId/addresses/:addressId", updateWallet);
export default router;