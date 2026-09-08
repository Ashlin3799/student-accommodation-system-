require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const applicationRoutes = require('./routes/applications');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/api/student', (req, res) => {
  res.json({
    name: "Purva Dilip Dongre",
    studentId: "s225385045"
  });
});

app.use('/api/applications', applicationRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});