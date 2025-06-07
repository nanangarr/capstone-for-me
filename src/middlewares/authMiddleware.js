const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Akses ditolak. Token tidak tersedia' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token tidak valid' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        console.log('User in token:', req.user);

        // Ambil NIP dari token
        const nip = req.user.NIP || req.user.id || req.user.nip;

        if (!nip) {
            return res.status(403).json({ error: 'Token tidak valid, NIP tidak ditemukan' });
        }

        const user = await Users.findByPk(nip);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Akses admin ditolak' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { authenticate, isAdmin };