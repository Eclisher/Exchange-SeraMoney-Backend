import { pool } from "../config/database.js";
export const createWallet = async (req, res) => {
  const { name, lien, description, addresses } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const walletResult = await client.query(
      `INSERT INTO wallets (name, lien, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, lien, description],
    );
    const wallet = walletResult.rows[0];
    if (Array.isArray(addresses)) {
      for (const addr of addresses) {
        await client.query(
          `INSERT INTO wallet_addresses (wallet_id, crypto_id, network, address)
           VALUES ($1, $2, $3, $4)`,
          [wallet.id, addr.crypto_id, addr.network, addr.address],
        );
      }
    }
    await client.query("COMMIT");
    res.status(201).json(wallet);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  } finally {
    client.release();
  }
};

export const getWallets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.id,
        w.name,
        w.lien,
        w.description,
        COALESCE(
          json_agg(
            json_build_object(
              'crypto_id', wa.crypto_id,
              'network', wa.network,
              'address', wa.address
            )
          ) FILTER (WHERE wa.id IS NOT NULL),
          '[]'
        ) AS addresses
      FROM wallets w
      LEFT JOIN wallet_addresses wa ON wa.wallet_id = w.id
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
export const updateWallet = async (req, res) => {
  const { id } = req.params;
  const { name, lien, description } = req.body;

  try {
    const result = await pool.query(
      `UPDATE wallets
       SET name=$1, lien=$2, description=$3, updated_at=NOW()
       WHERE id=$4
       RETURNING *`,
      [name, lien, description, id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};