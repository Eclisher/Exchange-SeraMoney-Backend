import { pool } from "../config/database.js";

async function createCrypto(data) {
  const { symbol, name, buy_rate, sell_rate, color, networks } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const cryptoResult = await client.query(
      `INSERT INTO cryptos (symbol, name, buy_rate, sell_rate, color)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [symbol, name, buy_rate, sell_rate, color],
    );

    const crypto = cryptoResult.rows[0];

    for (const network of networks) {
      await client.query(
        `INSERT INTO crypto_networks (crypto_id, network)
         VALUES ($1, $2)`,
        [crypto.id, network],
      );
    }

    await client.query("COMMIT");

    return crypto;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getAllCryptos() {
  const result = await pool.query(`
    SELECT 
      c.*,
      COALESCE(
        json_agg(n.network) FILTER (WHERE n.network IS NOT NULL),
        '[]'
      ) AS networks
    FROM cryptos c
    LEFT JOIN crypto_networks n ON c.id = n.crypto_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);

  return result.rows;
}

async function updateCrypto(id, data) {
  const { buy_rate, sell_rate, networks } = data;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE cryptos
       SET buy_rate = $1,
           sell_rate = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [buy_rate, sell_rate, id],
    );

    if (networks) {
      await client.query(`DELETE FROM crypto_networks WHERE crypto_id = $1`, [
        id,
      ]);

      for (const network of networks) {
        await client.query(
          `INSERT INTO crypto_networks (crypto_id, network)
           VALUES ($1, $2)`,
          [id, network],
        );
      }
    }

    await client.query("COMMIT");

    return { message: "Crypto updated successfully" };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function deleteCrypto(id) {
  await pool.query(`DELETE FROM cryptos WHERE id = $1`, [id]);

  return { message: "Crypto deleted successfully" };
}

export {
  createCrypto,
  getAllCryptos,
  updateCrypto,
  deleteCrypto,
};
