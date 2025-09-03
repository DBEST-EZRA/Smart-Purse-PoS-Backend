import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

/**
 * GET /settings
 * Fetch all settings (optional filter by storeId)
 */
router.get("/", async (req, res) => {
  try {
    const { storeId } = req.query;

    let query = supabase
      .from("settings")
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
 * GET /settings/:id
 * Fetch single settings record by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /settings
 * Create a new settings record
 */
router.post("/", async (req, res) => {
  try {
    const {
      storeId,
      currency,
      timezone,
      tax_rate,
      theme,
      notifications_enabled,
    } = req.body;

    const { data, error } = await supabase
      .from("settings")
      .insert([
        {
          storeid: storeId,
          currency,
          timezone,
          tax_rate,
          theme,
          notifications_enabled,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /settings/:id
 * Update an existing settings record
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      storeId,
      currency,
      timezone,
      tax_rate,
      theme,
      notifications_enabled,
    } = req.body;

    const { data, error } = await supabase
      .from("settings")
      .update({
        storeid: storeId,
        currency,
        timezone,
        tax_rate,
        theme,
        notifications_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
