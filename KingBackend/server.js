require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const connectDB = require("./config/db");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// connecting database
connectDB();

// Routes
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5501;
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server running on port ${PORT}`);
});
