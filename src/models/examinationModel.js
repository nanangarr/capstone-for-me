const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Examination = db.define('pemeriksaan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tanggal_periksa: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    umur: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hipertensi: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    penyakit_jantung: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    menikah: {
        type: DataTypes.ENUM('Ya', 'Tidak'),
        allowNull: false
    },
    pekerjaan: {
        type: DataTypes.ENUM('Anak-anak', 'PNS', 'Swasta', 'Wiraswasta', 'Belum Bekerja'),
        allowNull: false
    },
    tempat_tinggal: {
        type: DataTypes.ENUM('Perkotaan', 'Pedesaan'),
        allowNull: false
    },
    glukosa: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    merokok: {
        type: DataTypes.ENUM('Dulu Merokok', 'Tidak Pernah Merokok', 'Merokok', 'Tidak Diketahui'),
        allowNull: false
    },
    stroke: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    gambar_MRI: {
        type: DataTypes.STRING,
        allowNull: false
    },
    kategori: {
        type: DataTypes.STRING,
        allowNull: true
    },
    deskripsi: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    solusi: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Examination;