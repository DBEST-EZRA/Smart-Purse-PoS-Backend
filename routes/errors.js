import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

/**
 * GET /errors
 * Fetch all errors (optional filter by storeId)
 */
router.get("/", async (req, res) => {
  try {
    const { storeId } = req.query;

    let query = supabase
      .from("errors")
      .select("*")
      .order("created_at", { ascending: false });

    if (storeId) {
      query = query.eq("storeid", storeId);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /errors
 * Log a new error
 */
router.post("/", async (req, res) => {
  try {
    const { storeId, error_message } = req.body;

    const { data, error } = await supabase
      .from("errors")
      .insert([{ storeid: storeId, error_message }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
