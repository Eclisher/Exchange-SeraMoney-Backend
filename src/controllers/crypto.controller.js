import {
  createCrypto,
  getAllCryptos,
  updateCrypto,
  deleteCrypto,
} from "../service/crypto.service.js";
export const create = async (req, res) => {
  try {
    const crypto = await createCrypto(req.body);
    res.status(201).json(crypto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const cryptos = await getAllCryptos();
    res.json(cryptos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const result = await updateCrypto(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const result = await deleteCrypto(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
