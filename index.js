import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase connection
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test Supabase connection on startup
(async () => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .limit(1);
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

// Example: get all products
app.get("/products", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Example: add product
app.post("/products", async (req, res) => {
  const { name, price } = req.body;
  const { data, error } = await supabase
    .from("products")
    .insert([{ name, price }]);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
