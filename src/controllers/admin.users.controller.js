import { pool } from "../config/database.js";

export const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, phone_number, mobile_money_type, created_at
      FROM users
      WHERE role = 'CLIENT'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getClientTransactions = async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [clientId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
