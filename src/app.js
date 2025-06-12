const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Impor models (dengan relasi)
const db = require('./config/db');
const models = require('./models/index');

// Middleware
app.use(cors({ 
    origin: [
        'http://localhost:3000',
        'https://capstone-for-me-production-e843.up.railway.app',
        'https://capstone-for-me-production-9af6.up.railway.app',
        'https://capstone-project-mri.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route for API status check
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'Server berjalan dengan baik',
        version: '1.0.0',
        apiEndpoints: {
            auth: '/api/auth',
            admin: '/api/admin',
            patients: '/api/patients',
            predictions: '/api/predictions'
        }
    });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/patients', require('./routes/predictionRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));

//Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Terjadi kesalahan server!' });
});

module.exports = app;
