import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { storeId } = req.query;
  console.log("Received storeId:", storeId);

  if (!storeId) {
    return res.status(400).json({ error: "storeId is required" });
  }

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId);

  if (error) return res.status(400).json({ error: error.message });
  console.log("Fetched store:", data.length);
  res.json(data);
});

export default router;
