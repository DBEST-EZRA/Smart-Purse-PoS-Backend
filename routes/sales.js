import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

/**
 * GET /sales
 * Fetch sales records by store id
 */
router.get("/", async (req, res) => {
  try {
    const { storeid } = req.query;

    let query = supabase
      .from("sales")
      .select(
        `
        *,
        sale_item(*)
      `
      ) // join sale_item table
      .order("created_at", { ascending: false });

    if (storeid) {
      query = query.eq("storeid", storeid);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /sales
 * Add a new sale record with items at the same time
 */
router.post("/", async (req, res) => {
  try {
    const {
      billno,
      servedby,
      paymentstatus = "unpaid",
      total,
      paymentmethod,
      storeid,
      vat = 0,
      items = [], // array of sale items
    } = req.body;

    // 1️⃣ Insert into sales
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert([
        {
          billno,
          servedby,
          paymentstatus,
          total,
          paymentmethod,
          storeid,
          vat,
        },
      ])
      .select()
      .single();

    if (saleError) throw saleError;

    // 2️⃣ Insert into sale_item (if any items exist)
    if (items.length > 0) {
      const saleItems = items.map((item) => ({
        billno: billno,
        name: item.name,
        rate: item.rate,
        quantity: item.quantity,
        storeid: storeid,
        vat: item.vat || 0,
      }));

      const { error: itemsError } = await supabase
        .from("sale_item")
        .insert(saleItems);

      if (itemsError) {
        // rollback sale if items fail
        await supabase.from("sales").delete().eq("billno", billno);
        throw itemsError;
      }
    }

    res.status(201).json({
      ...sale,
      items,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /sales/:id
 * Update a sale record
 * use this for checkout
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      billno,
      servedby,
      paymentstatus,
      total,
      paymentmethod,
      storeid,
      vat,
    } = req.body;

    const { data, error } = await supabase
      .from("sales")
      .update({
        billno,
        servedby,
        paymentstatus,
        total,
        paymentmethod,
        storeid,
        vat,
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Use this for Recalled Bill
// Edits Sale alongside Sale Item
router.put("/recall/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      billno,
      servedby,
      paymentstatus,
      total,
      paymentmethod,
      storeid,
      vat,
      sale_item = [],
    } = req.body;

    // 1️⃣ Update the main sale
    const { data: updatedSale, error: saleError } = await supabase
      .from("sales")
      .update({
        billno,
        servedby,
        paymentstatus,
        total,
        paymentmethod,
        storeid,
        vat,
      })
      .eq("id", id)
      .select()
      .single();

    if (saleError) throw saleError;

    // 2️⃣ Delete existing items for this billno
    await supabase.from("sale_item").delete().eq("billno", billno);

    // 3️⃣ Insert the new sale items (don’t include subtotal!)
    if (sale_item.length > 0) {
      const newItems = sale_item.map((item) => ({
        billno,
        name: item.name,
        rate: item.rate,
        quantity: item.quantity,
        storeid,
        vat: item.vat || 0,
      }));

      const { error: itemsError } = await supabase
        .from("sale_item")
        .insert(newItems);

      if (itemsError) throw itemsError;
    }

    // 4️⃣ Respond with the updated sale + items
    res.json({
      ...updatedSale,
      sale_item,
    });
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
