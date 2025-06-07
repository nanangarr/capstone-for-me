const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/userModel');
const { sendPasswordEmail } = require('../utils/emailSender');

/**
 * @method POST
 * @route /auth/register
 * @desc Mendaftarkan user baru tanpa password
 */
const register = async (req, res) => {
    try {
        const { NIP, email, nama_lengkap, jabatan, instansi } = req.body;

        // Cek apakah email/NIP sudah terdaftar
        const existingUser = await Users.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        // Buat user tanpa password
        const newUser = await Users.create({
            NIP,
            email,
            nama_lengkap,
            jabatan,
            instansi,
            password: null
        });

        res.status(201).json({
            message: 'Registrasi berhasil! Tunggu konfirmasi admin untuk mendapatkan password'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method POST
 * @route /auth/login
 * @desc Login user dan mendapatkan token JWT
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Cari user berdasarkan nama
        const user = await Users.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        // Cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Password salah' });
        }

        // Buat token
        const token = jwt.sign(
            {
                NIP: user.NIP,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                NIP: user.NIP,
                username: user.username,
                role: user.role,
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { register, login };