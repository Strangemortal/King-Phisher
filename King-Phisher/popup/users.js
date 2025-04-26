import express from 'express';
import pool from '../db.js'; // link to db.js

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [existing] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [email, password]);
    res.status(200).json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
