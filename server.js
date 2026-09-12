global.crypto = require("crypto").webcrypto;

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./src/routes/rooms");
const applicationRoutes = require("./routes/applications");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

// Room Management routes
app.use("/api/rooms", roomRoutes);

// Application Module routes
app.use("/api/applications", applicationRoutes);

// Admin Review routes
app.use("/api/admin", adminRoutes);

// Complaint routes
app.use("/api/complaints", complaintRoutes);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Admin Dashboard Page
app.get("/admin/dashboard.html", (req, res) => {
    res.sendFile(
        path.join(__dirname, "public", "admin", "dashboard.html")
    );
});

// MongoDB connection
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});