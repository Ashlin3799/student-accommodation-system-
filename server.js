global.crypto = require("crypto").webcrypto;

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const applicationRoutes = require("./routes/applications");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/applications", applicationRoutes);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Route for Admin Dashboard Page
app.get("/admin/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "admin", "dashboard.html"));
});

app.get('/api/student', (req, res) => {
  res.json({ name: "Purva Dilip Dongre", studentId: "s225385045" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });



// Test route
app.get("/", (req, res) => {
    res.send("Student Accommodation Management System is running");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});