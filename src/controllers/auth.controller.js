import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const isValidPhoneForMobileMoney = (phone, mobileMoneyType) => {
  const cleaned = phone.replace(/\s+/g, "");
  const patterns = {
    ORANGE: /^(?:\+261|0)(32|37)\d{7}$/,
    MVOLA: /^(?:\+261|0)(34|38)\d{7}$/,
  };

  const pattern = patterns[mobileMoneyType.toUpperCase()];
  if (!pattern) return false;

  return pattern.test(cleaned);
};


export const register = async (req, res) => {
  const { full_name, phone_number, mobile_money_type, password } = req.body;

  if (!full_name || !phone_number || !mobile_money_type || !password) {
    return res.status(400).json({ message: "Champs manquants" });
  }
  if (!isValidPhoneForMobileMoney(phone_number, mobile_money_type)) {
    return res.status(400).json({
      message: "Numéro incohérent avec le type Mobile Money sélectionné",
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (full_name, phone_number, mobile_money_type, password_hash)
       VALUES ($1,$2,$3,$4)`,
      [full_name, phone_number, mobile_money_type.toUpperCase(), hash]
    );

    res.status(201).json({ message: "Compte créé avec succès" });
  } catch (err) {
    res.status(400).json({ message: "Numéro déjà utilisé" });
  }
};


export const login = async (req, res) => {
  const { phone_number, full_name, password } = req.body;

  if ((!phone_number && !full_name) || !password) {
    return res.status(400).json({ message: "Champs manquants" });
  }

  let result;

  try {
    if (phone_number) {
      result = await pool.query(
        "SELECT * FROM users WHERE phone_number = $1 AND is_active = true",
        [phone_number]
      );
    } else if (full_name) {
      result = await pool.query(
        "SELECT * FROM users WHERE full_name = $1 AND is_active = true",
        [full_name]
      );
    }

    if (!result.rows.length) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }
    console.log("Mot de passe saisi:", password);
    console.log("Hash en base:", user.password_hash);
    console.log("Résultat comparaison:", valid);
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
  