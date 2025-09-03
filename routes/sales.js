import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

/**
 * GET /sales
 * Fetch all sales records
 */
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/**
 * GET /sales/:id
 * Fetch a single sale by ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/**
 * POST /sales
 * Add a new sale record
 */
router.post("/", async (req, res) => {
  try {
    const { item, description, sellingprice, profit, quantity, storeid } =
      req.body;

    const { data, error } = await supabase
      .from("sales")
      .insert([
        {
          item,
          description,
          sellingprice,
          profit,
          quantity,
          storeid,
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
 * PUT /sales/:id
 * Update a sale record
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { item, description, sellingprice, profit, quantity, storeid } =
      req.body;

    const { data, error } = await supabase
      .from("sales")
      .update({
        item,
        description,
        sellingprice,
        profit,
        quantity,
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
 * DELETE /sales/:id
 * Delete a sale record
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
