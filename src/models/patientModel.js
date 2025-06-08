const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Patient = db.define('pasien', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tempat_lahir: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tanggal_lahir: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    no_hp: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = Patient;