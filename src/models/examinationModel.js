const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Examination = db.define('pemeriksaan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    jenis_kelamin: {
        type: DataTypes.ENUM('Laki-laki', 'Perempuan'),
        allowNull: false
    },
    umur: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    hipertensi: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    berat_badan: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tinggi_badan: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    penyakit_jantung: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    status_nikah: {
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

    // untuk menyimpan hasil pemeriksaan
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