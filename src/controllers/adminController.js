const bcrypt = require('bcryptjs');
const Users = require('../models/userModel');
const { sendPasswordEmail } = require('../utils/emailSender');


/**
 * @method GET
 * @route /admin/users/pending
 * @desc Mendapatkan daftar user yang belum disetujui (password masih null)
 */
const getPendingUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            where: { password: null },
            attributes: ['NIP', 'email', 'nama_lengkap', 'jabatan', 'instansi']
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method GET
 * @route /admin/users
 * @desc Mendapatkan daftar semua user
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await Users.findAll({
            attributes: [
                'NIP',
                'email',
                'nama_lengkap',
                'jabatan',
                'instansi',
                'username',
                'role',
                'password', 
                [
                    Users.sequelize.literal('CASE WHEN password IS NULL THEN false ELSE true END'),
                    'isApproved'
                ]
            ]
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method GET
 * @route /admin/users/:nip
 * @desc Mendapatkan data user berdasarkan NIP
 */
const getUserbyNIP = async (req, res) => {
    try {
        const { nip } = req.params;

        // Cari user berdasarkan NIP
        const user = await Users.findByPk(nip, {
            attributes: ['NIP', 'email', 'nama_lengkap', 'jabatan', 'instansi', 'username', 'role',
                [
                    Users.sequelize.literal('CASE WHEN password IS NULL THEN false ELSE true END'),
                    'isApproved'
                ]
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method PUT
 * @route /admin/users/:nip
 * @desc Update data user berdasarkan NIP
 */
const updateUserbyNIP = async (req, res) => {
    try {
        const { nip } = req.params;
        const { username, password, email, nama_lengkap, jabatan, instansi, role } = req.body;

        // Cari user
        const user = await Users.findByPk(nip);
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        // Buat objek untuk update
        const updateData = {};

        // Tambahkan field yang akan diupdate jika ada di request
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (nama_lengkap) updateData.nama_lengkap = nama_lengkap;
        if (jabatan) updateData.jabatan = jabatan;
        if (instansi) updateData.instansi = instansi;
        if (role) updateData.role = role;

        // Jika password diubah, hash dulu
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        await user.update(updateData);

        res.json({
            message: 'User berhasil diperbarui',
            user: {
                NIP: user.NIP,
                email: user.email,
                nama_lengkap: user.nama_lengkap,
                jabatan: user.jabatan,
                instansi: user.instansi,
                username: user.username,
                role: user.role,
                isApproved: user.password ? true : false
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// const approveUser = async (req, res) => {
//     try {
//         const { nip } = req.params;
//         const { username, password } = req.body;

//         // Cari user
//         const user = await Users.findByPk(nip);
//         if (!user) {
//             return res.status(404).json({ error: 'User tidak ditemukan' });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Update user
//         await user.update({
//             username,
//             password: hashedPassword
//         });

//         // Kirim email dengan parameter yang benar
//         await sendPasswordEmail(user.email, username, password);

//         res.json({ message: 'User berhasil diaktifkan' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

/**
 * @method DELETE
 * @route /admin/users/:nip
 * @desc Hapus user berdasarkan NIP
 */
const removeUser = async (req, res) => {
    try {
        const { nip } = req.params;

        // Cari user
        const user = await Users.findByPk(nip);
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        // Hapus user
        await user.destroy();

        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getPendingUsers, getAllUsers, removeUser, getUserbyNIP, updateUserbyNIP };