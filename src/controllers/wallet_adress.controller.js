import { pool } from "../config/database.js";
export const createWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { crypto_id, network, address } = req.body;
    const result = await pool.query(
      `INSERT INTO wallet_addresses (wallet_id, crypto_id, network, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [walletId, crypto_id, network, address],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getWallets = async (req, res) => {
  try {
    const { walletId } = req.params;
    const result = await pool.query(
      `SELECT id, wallet_id, crypto_id, network, address
       FROM wallet_addresses
       WHERE wallet_id = $1
       ORDER BY network ASC, address ASC`,
      [walletId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const updateWallet = async (req, res) => {
  try {
    const { walletId, addressId } = req.params;
    const result = await pool.query(
      `DELETE FROM wallet_addresses
       WHERE id = $1 AND wallet_id = $2
       RETURNING *`,
      [addressId, walletId],
    );
    if (!result.rows[0]) {
      return res.status(404).json({ message: "Adresse introuvable" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
