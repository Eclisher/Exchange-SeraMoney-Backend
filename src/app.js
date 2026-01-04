import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import adminTransactionRoutes from "./routes/admin.transactions.routes.js";
import adminUserRoutes from "./routes/admin.users.routes.js";
import adminLogRoutes from "./routes/admin.logs.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Ton serveur est allumé " });
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminTransactionRoutes);
app.use("/api/admin", adminUserRoutes);
app.use("/api/admin", adminLogRoutes);
export default app;
