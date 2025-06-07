const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Impor models (dengan relasi)
const db = require('./config/db');
const models = require('./models/index');

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/patients', require('./routes/predictionRoutes'));

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan server!' });
});

module.exports = app;