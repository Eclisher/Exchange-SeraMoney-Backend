import express from 'express';
import {
  createWallet,
  getWallets,
  updateWallet,
} from "../controllers/wallet_adress.controller.js";

const router = express.Router();

router.post("/wallets/:walletId/addresses", createWallet);
router.get("/wallets/:walletId/addresses", getWallets);
router.delete("/wallets/:walletId/addresses/:addressId", updateWallet);
export default router;