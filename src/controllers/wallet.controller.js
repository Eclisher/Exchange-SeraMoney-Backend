import { createWallet, getAllWallets, getWalletById, updateWallet, deleteWallet } from "../service/wallet.service.js";

export const create = async (req, res) => {
  try {
    const wallet = await createWallet(req.body);
    res.status(201).json(wallet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
    try {
        const wallets = await getAllWallets();
        res.json(wallets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const wallet = await getWalletById(req.params.id);
        res.json(wallet);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const wallet = await updateWallet(req.params.id, req.body);
        res.json(wallet);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const remove = async (req, res) => {
    try {
        const wallet = await deleteWallet(req.params.id);
        res.json(wallet);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};