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
                description: 'Stroke iskemik terjadi akibat sumbatan pada pembuluh darah otak, yang mengakibatkan kekurangan pasokan oksigen pada jaringan otak. Ini biasanya disebabkan oleh pembekuan darah atau penyempitan pembuluh darah yang mengurangi aliran darah ke bagian otak tertentu.',
                solution: '1. Prosedur medis untuk melarutkan bekuan darah yang menyumbat pembuluh darah otak (Trombolisis).\n2. Prosedur untuk mengangkat bekuan darah yang menghalangi aliran darah ke otak (Trombektomi).\n3. Pencegahan Sekunder: Langkah-langkah untuk mencegah stroke berulang, termasuk penggunaan obat-obatan dan perubahan gaya hidup.'
            },
            Haemorrhagic: {
                description: 'Stroke hemoragik terjadi ketika pembuluh darah di otak pecah, menyebabkan perdarahan ke dalam jaringan otak. Ini bisa terjadi akibat aneurisma yang pecah, tekanan darah tinggi yang tidak terkontrol, atau kelainan pembuluh darah lainnya.',
                solution: '1. Kontrol Perdarahan Penghentian perdarahan dengan menggunakan obat-obatan.\n2. Pengelolaan tekanan dalam tengkorak untuk mencegah kerusakan lebih lanjut pada otak.\n3. Intervensi Bedah: Tindakan bedah diperlukan untuk mengangkat darah atau memperbaiki pembuluh darah yang pecah.\n4. Kontrol Hipertensi Pengelolaan tekanan darah tinggi untuk mencegah perdarahan lebih lanjut atau stroke berulang.'
            },
            Normal: {
                description: 'Tidak terjadi gangguan pada aliran darah atau perdarahan di otak. Pasien dalam kondisi ini tidak mengalami stroke, tetapi mungkin memiliki faktor risiko yang perlu diwaspadai.',
                solution: '1. Melakukan pencegahan stroke dengan gaya hidup sehat dan pengawasan faktor risiko, \n2. Monitoring Rutin, Pemeriksaan kesehatan secara berkala untuk mendeteksi masalah kesehatan lebih awal dan mengontrol faktor risiko yang ada.'
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