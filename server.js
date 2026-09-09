require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const roomRoutes = require('./src/routes/rooms');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/room_management';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/rooms', roomRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });