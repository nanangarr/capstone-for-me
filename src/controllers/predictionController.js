const { Patient, Examination } = require('../models');
const fs = require('fs');

/**
 * @method POST
 * @route /patients/add
 * @desc Tambahkan data pasien dan pemeriksaan baru
 */
const addPatientAndExamination = async (req, res) => {
    try {
        // Extract data pasien dari request body
        const {
            nama,
            jenis_kelamin,
            alamat,
            tanggal_lahir,
            tanggal_periksa,
            umur,
            hipertensi,
            penyakit_jantung,
            menikah,
            pekerjaan,
            tempat_tinggal,
            glukosa,
            merokok,
            stroke,
            kategori,
            deskripsi,
            solusi
        } = req.body;

        // Dapatkan path file jika ada upload
        const gambar_MRI = req.file ? req.file.path.replace(/\\/g, '/') : null;

        // Validasi field yang dibutuhkan
        if (!nama || !jenis_kelamin || !alamat || !tanggal_lahir || !umur || !hipertensi || !penyakit_jantung || !menikah || !pekerjaan || !tempat_tinggal || !glukosa || !merokok || !stroke ) {
            // Hapus file yang terupload jika validasi gagal
            if (gambar_MRI && fs.existsSync(gambar_MRI)) {
                fs.unlinkSync(gambar_MRI);
            }

            return res.status(400).json({
                error: 'Semua field wajib diisi (nama, jenis kelamin, alamat, tanggal lahir, umur, hipertensi, penyakit jantung, menikah, pekerjaan, tempat tinggal, glukosa, merokok, stroke)'
            });
        }

        //

        // Dapatkan NIP dari token user yang terautentikasi
        const NIP = req.user.NIP;

        // Buat record pasien baru
        const patient = await Patient.create({
            nama,
            jenis_kelamin,
            alamat,
            tanggal_lahir,
            NIP 
        });

        // Buat record pemeriksaan
        const examination = await Examination.create({
            pasien_id: patient.id,
            tanggal_periksa: tanggal_periksa || new Date(),
            umur: parseInt(umur),
            hipertensi: hipertensi === 'true' || hipertensi === '1' || hipertensi === true || hipertensi === 1,
            penyakit_jantung: penyakit_jantung === 'true' || penyakit_jantung === '1' || penyakit_jantung === true || penyakit_jantung === 1,
            menikah: (menikah === 'true' || menikah === '1' || menikah === true || menikah === 1) ? 'Ya' : 'Tidak',
            pekerjaan,
            tempat_tinggal,
            glukosa: parseFloat(glukosa),
            merokok,
            stroke,
            gambar_MRI,
            kategori: kategori || null,
            deskripsi: deskripsi || null,
            solusi: solusi || null
        });

        // Kembalikan hasil
        res.status(201).json({
            message: 'Data pasien dan pemeriksaan berhasil disimpan',
            patient: {
                id: patient.id,
                nama: patient.nama,
                jenis_kelamin: patient.jenis_kelamin,
                tanggal_lahir: patient.tanggal_lahir,
                alamat: patient.alamat
            },
            examination: {
                id: examination.id,
                tanggal_periksa: examination.tanggal_periksa,
                umur: examination.umur,
                hipertensi: examination.hipertensi,
                penyakit_jantung: examination.penyakit_jantung,
                menikah: examination.menikah,
                pekerjaan: examination.pekerjaan,
                tempat_tinggal: examination.tempat_tinggal,
                glukosa: examination.glukosa,
                merokok: examination.merokok,
                stroke: examination.stroke,
                gambar_MRI: examination.gambar_MRI,
                kategori: examination.kategori,
                deskripsi: examination.deskripsi,
                solusi: examination.solusi
            }
        });
    } catch (error) {
        console.error('Error in addPatientAndExamination:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method GET
 * @route /predictions
 * @desc Dapatkan semua data pasien dengan pemeriksaan terbaru mereka
 */
const getAllPredictions = async (req, res) => {
    try {
        // Dapatkan NIP dari user yang terautentikasi
        const NIP = req.user.NIP;

        // Cari semua pasien untuk healthcare provider ini
        const patients = await Patient.findAll({
            where: { NIP },
            include: [
                {
                    model: Examination,
                    as: 'pemeriksaans',
                    order: [['createdAt', 'DESC']]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(patients);
    } catch (error) {
        console.error('Error in getAllPatients:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method GET
 * @route /patients
 * @desc Dapatkan semua data pasien dengan pemeriksaan terbaru mereka
 */
const getAllPatients = async (req, res) => {
    try {
        // Dapatkan NIP dari user yang terautentikasi
        const NIP = req.user.NIP;

        // Cari semua pasien untuk healthcare provider ini
        const patients = await Patient.findAll({
            where: { NIP },

            order: [['createdAt', 'DESC']]
        });

        res.json(patients);
    } catch (error) {
        console.error('Error in getAllPatients:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method GET
 * @route /patients/:id
 * @desc Dapatkan detail pasien dengan semua pemeriksaan
 */
const getPatientDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // Cari pasien berdasarkan ID
        const patient = await Patient.findByPk(id, {
            include: [
                {
                    model: Examination,
                    as: 'pemeriksaans',
                    order: [['createdAt', 'DESC']]
                }
            ]
        });

        if (!patient) {
            return res.status(404).json({ error: 'Pasien tidak ditemukan' });
        }

        // Verifikasi pasien milik healthcare provider yang login
        if (patient.NIP !== req.user.NIP) {
            return res.status(403).json({ error: 'Tidak memiliki akses ke data pasien ini' });
        }

        res.json(patient);
    } catch (error) {
        console.error('Error in getPatientDetail:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * @method GET
 * @route /patients/examinations/
 * @desc Dapatkan semua data pemeriksaan pasien
 */
const getAllExaminations = async (req, res) => {
    try {
        // Dapatkan NIP dari user yang terautentikasi
        const NIP = req.user.NIP;

        // Cari semua pemeriksaan untuk healthcare provider ini
        const examinations = await Examination.findAll({
            include: [
                {
                    model: Patient,
                    as: 'pasiens',
                    where: { NIP }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(examinations);
    } catch (error) {
        console.error('Error in getAllExaminations:', error);
        res.status(500).json({ error: error.message });
    }
};


/**
 * @method GET
 * @route /patients/examinations/:id
 * @desc Dapatkan detail pemeriksaan berdasarkan ID
 */
const getExaminationDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const examination = await Examination.findByPk(id, {
            include: [
                {
                    model: Patient,
                    as: 'pasiens'
                }
            ]
        });

        if (!examination) {
            return res.status(404).json({ error: 'Pemeriksaan tidak ditemukan' });
        }

        // Verifikasi pasien milik healthcare provider yang login
        if (examination.pasiens.NIP !== req.user.NIP) {
            return res.status(403).json({ error: 'Tidak memiliki akses ke data ini' });
        }

        res.json(examination);
    } catch (error) {
        console.error('Error in getExaminationDetail:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addPatientAndExamination,
    getAllPredictions,
    getAllPatients,
    getPatientDetail,
    getAllExaminations,
    getExaminationDetail
};