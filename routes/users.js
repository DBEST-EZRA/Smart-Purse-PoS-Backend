import express from "express";
import { supabase } from "../index.js";

const router = express.Router();

// Fetch all users
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Add user (creates auth user + business user)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role, storeid } = req.body;

    // 1. Create user in Supabase Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: "12345678", // default password
        email_confirm: true,
      });
    if (authError) throw authError;

    const auth_user_id = authUser.user.id;

    // 2. Insert into users table
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert([{ name, email, phone, role, storeid, auth_user_id }])
      .select()
      .single();

    if (userError) throw userError;

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, storeid } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ name, phone, role, storeid })
      .eq("id", id)
      .select();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user (auth + db)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get auth_user_id first
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("auth_user_id")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Auth
    await supabase.auth.admin.deleteUser(user.auth_user_id);

    // Delete from users table
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset password (send email)
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://your-app.com/update-password", // change to your frontend route
    });

    if (error) throw error;

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
