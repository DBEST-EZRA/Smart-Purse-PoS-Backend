import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import userRoutes from "./routes/users.js";
import inventoryRoutes from "./routes/inventory.js";
import saleRoutes from "./routes/sales.js";
import paymentRoutes from "./routes/payments.js";
import errorRoutes from "./routes/errors.js";
import settingRoutes from "./routes/settings.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Try connection
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// Test Supabase connection on startup
(async () => {
  try {
    const { data, error } = await supabase.from("users").select("id").limit(1);
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
    } else {
      console.log("✅ Supabase connection successful!");
    }
  } catch (err) {
    console.error("❌ Error testing Supabase connection:", err.message);
  }
})();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Routes
app.use("/users", userRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/sales", saleRoutes);
app.use("/payments", paymentRoutes);
app.use("/errors", errorRoutes);
app.use("/settings", settingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
