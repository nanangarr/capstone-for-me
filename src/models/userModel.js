const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Users = db.define('user', {
    NIP: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true // Sementara boleh null
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    foto: DataTypes.STRING,
    nama_lengkap: DataTypes.STRING,
    jabatan: DataTypes.STRING,
    instansi: DataTypes.STRING,
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user'
    }
}, {
    timestamps: false
});

module.exports = Users;