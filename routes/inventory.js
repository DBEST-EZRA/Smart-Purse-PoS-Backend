import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

/**
 * GET /inventory
 * Fetch all inventory items
 */
router.get("/", async (req, res) => {
  const { storeId } = req.query;
  console.log("Received storeId:", storeId);

  if (!storeId) {
    return res.status(400).json({ error: "storeId is required" });
  }

  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("store_id", storeId);

  if (error) return res.status(400).json({ error: error.message });
  console.log("Fetched inventory rows:", data.length);
  res.json(data);
});

/**
 * GET /inventory/:id
 * Fetch a single inventory item by ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/**
 * POST /inventory
 * Add a new inventory item
 */
router.post("/", async (req, res) => {
  try {
    const { item, description, rate, category, vat, storeid } = req.body;

    const { data, error } = await supabase
      .from("inventory")
      .insert([
        {
          item,
          description,
          rate,
          category,
          vat,
          store_id: storeid,
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
 * PUT /inventory/:id
 * Update an inventory item
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { item, description, rate, category, vat, storeid } = req.body;

    const { data, error } = await supabase
      .from("inventory")
      .update({
        item,
        description,
        rate,
        category,
        vat,
        storeid,
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

/**
 * DELETE /inventory/:id
 * Delete an inventory item
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
