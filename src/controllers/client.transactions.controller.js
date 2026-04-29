import { pool } from "../config/database.js";

export const getMyTransactions = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT 
    t.*,
    w.name AS wallet_name,
    w.lien AS wallet_lien
   FROM transactions t
   LEFT JOIN wallets w ON t.wallet_id = w.id
   WHERE t.user_id = $1
   ORDER BY t.created_at DESC`,
      [userId],
    );
    res.json(result.rows);
  } catch (err) {   
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
