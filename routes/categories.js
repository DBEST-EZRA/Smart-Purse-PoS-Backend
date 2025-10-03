import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

/**
 * Create Category
 * POST /categories
 */
router.post("/", async (req, res) => {
  const { category, storeid } = req.body;

  if (!category || !storeid) {
    return res.status(400).json({ error: "Category and storeid are required" });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert([{ category, storeid }])
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data[0]);
});

/**
 * Get All Categories (optionally filter by storeid)
 * GET /categories?storeid=xxx
 */
router.get("/", async (req, res) => {
  const { storeid } = req.query;

  let query = supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (storeid) query = query.eq("storeid", storeid);

  const { data, error } = await query;

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

/**
 * Get Category by ID
 * GET /categories/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json({ error: "Category not found" });

  res.json(data);
});

/**
 * Update Category
 * PUT /categories/:id
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category) return res.status(400).json({ error: "Category is required" });

  const { data, error } = await supabase
    .from("categories")
    .update({ category })
    .eq("id", id)
    .select();

  if (error) return res.status(400).json({ error: error.message });

  res.json(data[0]);
});

/**
 * Delete Category
 * DELETE /categories/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "Category deleted successfully" });
});

export default router;
