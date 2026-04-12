import {
    addTransactionImage,
    getImagesByTransaction,
  } from "../service/transactionImage.service.js";
  
  export const uploadTransactionImage = async (req, res) => {
    try {
      const { transaction_id, title } = req.body;
  
      if (!req.file) {
        return res.status(400).json({ message: "Aucun fichier envoyé" });
      }
  
      const base64 = req.file.buffer.toString("base64");
  
      const image = await addTransactionImage({
        transaction_id,
        base64,
        title: title || "Preuve",
      });
  
      res.status(201).json({
        message: "Image uploadée",
        data: image,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  export const getTransactionImages = async (req, res) => {
    try {
      const { transaction_id } = req.params;
  
      const images = await getImagesByTransaction(transaction_id);
  
      res.json(images);
    } catch (err) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  };