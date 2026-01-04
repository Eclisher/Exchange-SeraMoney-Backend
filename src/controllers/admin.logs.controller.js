import { pool } from "../config/database.js";

export const getAdminLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.id,
        l.action,
        l.created_at,
        u.full_name AS admin_name
      FROM admin_logs l
      JOIN users u ON u.id = l.admin_id
      ORDER BY l.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
