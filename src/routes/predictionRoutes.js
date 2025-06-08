const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
    //addPatientAndExamination,
    PredictionController,
    getAllPredictions,
    getAllPatients,
    getPatientDetail,
    getAllExaminations,
    getExaminationDetail
} = require('../controllers/predictionController');
const upload = require('../middlewares/uploadMiddleware');

router.use(authenticate);

//router.post('/add', upload.single('gambar_MRI'), addPatientAndExamination);
router.post('/predict', upload.single('gambar_MRI'), PredictionController.predictStroke);
router.get('/predictions', getAllPredictions);
router.get('/', getAllPatients);
router.get('/:id', getPatientDetail);
router.get('/examinations', getAllExaminations);
router.get('/examinations/:id', getExaminationDetail);

module.exports = router;