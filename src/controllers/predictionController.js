const { Examination, Patient } = require('../models');
const ModelLoader = require('../services/modelLoader');
const path = require('path');
const fs = require('fs');

/**
 * @method POST
 * @route /patients/add
 * @desc Tambahkan data pasien dan pemeriksaan baru
 */
class PredictionController {
    static async predictStroke(req, res) {
        try {
            // Simpan data pasien
            const patient = await Patient.create({
                nama: req.body.nama,
                tempat_lahir: req.body.tempat_lahir,
                tanggal_lahir: req.body.tanggal_lahir,
                no_hp: req.body.no_hp,
                NIP: req.user.NIP
            });

            // Simpan data pemeriksaan
            const examination = await Examination.create({
                pasien_id: patient.id,
                jenis_kelamin: req.body.jenis_kelamin,
                berat_badan: req.body.berat_badan,
                tinggi_badan: req.body.tinggi_badan,
                umur: req.body.umur,
                hipertensi: req.body.hipertensi === 'true',
                penyakit_jantung: req.body.penyakit_jantung === 'true',
                status_nikah: req.body.status_nikah,
                pekerjaan: req.body.pekerjaan,
                tempat_tinggal: req.body.tempat_tinggal,
                glukosa: req.body.glukosa,
                merokok: req.body.merokok,
                stroke: req.body.stroke === 'true',
                gambar_MRI: req.file.filename
            });

            const mriPath = path.join(__dirname, '../../uploads/', req.file.filename);
            const result = await ModelLoader.predict({ mriPath });
            const maxConfidence = Math.max(...result);
            if (maxConfidence < 0.6) {
                return res.status(200).json({
                    success: true,
                    warning: true,
                    message: 'Gambar tidak meyakinkan atau bukan MRI yang valid',
                    confidence: (maxConfidence * 100).toFixed(2) + '%'
                });
            }

            // Mapping kategori
            const strokeCategories = ['Haemorrhagic', 'Ischemic', 'Normal'];
            const predictedCategoryIndex = result.indexOf(maxConfidence);
            const predictedCategory = strokeCategories[predictedCategoryIndex];

            const { description, solution } = PredictionController.getStrokeInfo(predictedCategory);

            await examination.update({
                kategori: predictedCategory,
                deskripsi: description,
                solusi: solution
            });

            res.status(201).json({
                success: true,
                data: {
                    patient,
                    examination,
                    prediction: {
                        category: predictedCategory,
                        confidence: (Math.max(...result) * 100).toFixed(2) + '%'
                    }
                }
            });
        } catch (error) {
            console.error('Prediction error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static getStrokeInfo(category) {
        const info = {
            Ischemic: {
                description: 'Stroke iskemik terjadi ketika pembuluh darah ke otak tersumbat.',
                solution: '1. Obat trombolitik\n2. Antiplatelet\n3. Rehabilitasi\n4. Kontrol risiko'
            },
            Haemorrhagic: {
                description: 'Stroke hemoragik terjadi karena pecahnya pembuluh darah di otak.',
                solution: '1. Stabil tekanan darah\n2. Pembedahan\n3. Rehabilitasi intensif'
            },
            Normal: {
                description: 'Tidak terdeteksi tanda stroke pada gambar MRI.',
                solution: '1. Gaya hidup sehat\n2. Olahraga\n3. Rutin cek kesehatan'
            }
        };
        return info[category] || info.Normal;
    }
}

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
        const NIP = req.user.NIP;

        // Cari pasien berdasarkan ID dan NIP untuk memastikan hanya pasien dari provider yang bersangkutan
        const patient = await Patient.findOne({
            where: {
                id: id,
                NIP: NIP
            },
            include: [
                {
                    model: Examination,
                    as: 'pemeriksaans',
                }
            ],
            order: [
                [{ model: Examination, as: 'pemeriksaans' }, 'createdAt', 'DESC']
            ]
        });

        if (!patient) {
            return res.status(404).json({ error: 'Pasien tidak ditemukan atau Anda tidak memiliki akses' });
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
    PredictionController,
    getAllPredictions,
    getAllPatients,
    getPatientDetail,
    getAllExaminations,
    getExaminationDetail
};