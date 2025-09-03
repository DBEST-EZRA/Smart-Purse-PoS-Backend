import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Try connection
const supabase = createClient(
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

// Fetch all users
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Add user (creates auth user + business user)
app.post("/users", async (req, res) => {
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

    // 2. Insert into business users table
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
app.put("/users/:id", async (req, res) => {
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
app.delete("/users/:id", async (req, res) => {
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
app.post("/users/reset-password", async (req, res) => {
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
