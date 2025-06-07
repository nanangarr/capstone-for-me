const Patient = require('./patientModel');
const Examination = require('./examinationModel');
const Users = require('./userModel');

// Relasi: Pasien dimiliki oleh User (dokter/tenaga kesehatan)
Patient.belongsTo(Users, { foreignKey: 'NIP' });
Users.hasMany(Patient, { foreignKey: 'NIP' });

// Relasi: Pemeriksaan dimiliki oleh Pasien
Examination.belongsTo(Patient, { foreignKey: 'pasien_id', as: 'pasiens' });
Patient.hasMany(Examination, { foreignKey: 'pasien_id', as: 'pemeriksaans' });


module.exports = {
    Patient,
    Examination,
    Users
};