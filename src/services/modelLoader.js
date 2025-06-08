const tf = require('@tensorflow/tfjs-node');
const path = require('path');

class ModelLoader {
    constructor() {
        this.model = null;
        this.inputNames = null;
    }

    async loadModel() {
        if (!this.model) {
            try {
                const modelPath = path.join(__dirname, '../../public/models/model.json');
                this.model = await tf.loadGraphModel(`file://${modelPath}`);

                // Dapatkan nama input dari model
                const inputs = this.model.inputs;
                this.inputNames = inputs.map(input => input.name.split(':')[0]);

                console.log('Model loaded successfully');
                console.log('Model input names:', this.inputNames);
            } catch (error) {
                console.error('Failed to load model:', error);
                throw error;
            }
        }
        return this.model;
    }

    async predict(inputData) {
        try {
            const model = await this.loadModel();
            const { imageTensor, tabularTensor } = this.preprocessInput(inputData);

            // Buat objek input sesuai dengan nama input model
            const inputObject = {};

            // Jika model memiliki lebih dari satu input, kita akan menggabungkan tensor
            if (this.inputNames.length === 2) {
                inputObject[this.inputNames[0]] = imageTensor;
                inputObject[this.inputNames[1]] = tabularTensor;
            } else if (this.inputNames.length === 1) {
                // Jika hanya ada satu input, kita hanya perlu tensor gambar
                inputObject[this.inputNames[0]] = imageTensor;
            }

            const predictions = model.predict(inputObject);
            return predictions;
        } catch (error) {
            console.error('Prediction error:', error);
            throw error;
        }
    }

    preprocessInput(inputData) {
        // Proses gambar MRI
        const imageBuffer = require('fs').readFileSync(inputData.mriPath);
        let imageTensor = tf.node.decodeImage(imageBuffer, 3);
        imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
        imageTensor = imageTensor.div(255.0);
        imageTensor = imageTensor.expandDims();

        // Proses data tabular
        const tabularData = this.prepareTabularData(inputData);
        const tabularTensor = tf.tensor2d([tabularData]);

        return { imageTensor, tabularTensor };
    }

    prepareTabularData(data) {
        return [
            data.jenis_kelamin === 'Laki-laki' ? 1 : 0,
            parseFloat(data.umur),
            data.hipertensi ? 1 : 0,
            data.penyakit_jantung ? 1 : 0,
            data.status_nikah === 'Ya' ? 1 : 0,
            this.encodeWorkType(data.pekerjaan),
            this.encodeResidence(data.tempat_tinggal),
            parseFloat(data.glukosa),
            this.calculateBMI(data.berat_badan, data.tinggi_badan),
            this.encodeSmokingStatus(data.merokok)
        ];
    }

    calculateBMI(weight, height) {
        // Konversi tinggi badan ke meter jika lebih dari 3 (asumsi cm)
        const heightInMeters = height > 3 ? height / 100 : height;
        return weight / (heightInMeters * heightInMeters);
    }

    encodeWorkType(workType) {
        const encoding = {
            'Anak-anak': 0,
            'PNS': 1,
            'Swasta': 2,
            'Wiraswasta': 3,
            'Belum Bekerja': 4
        };
        return encoding[workType] || 0;
    }

    encodeResidence(residence) {
        return residence === 'Perkotaan' ? 1 : 0;
    }

    encodeSmokingStatus(smokingStatus) {
        const encoding = {
            'Tidak Pernah Merokok': 0,
            'Dulu Merokok': 1,
            'Merokok': 2,
            'Tidak Diketahui': 3
        };
        return encoding[smokingStatus] || 0;
    }
}

module.exports = new ModelLoader();