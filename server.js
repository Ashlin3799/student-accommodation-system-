const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const complaintRoutes = require('./routes/complaintRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/complaints', complaintRoutes);

// MongoDB connection
mongoose
  .connect('mongodb://127.0.0.1:27017/studentAccommodationDB')
  .then(() => {
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });