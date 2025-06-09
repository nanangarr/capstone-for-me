const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const fs = require('fs');

class ModelLoader {
    constructor() {
        this.model = null;
        this.inputName = null;
    }

    async loadModel() {
        if (!this.model) {
            try {
                const modelPath = path.join(__dirname, '../../public/models/model.json');
                this.model = await tf.loadGraphModel(`file://${modelPath}`);

                // Ambil nama input dari model
                this.inputName = this.model.inputs[0].name.split(':')[0];

                console.log('Model loaded:', this.inputName);
            } catch (error) {
                console.error('Failed to load model:', error);
                throw error;
            }
        }
        return this.model;
    }

    async predict({ mriPath }) {
        try {
            const model = await this.loadModel();
            const imageTensor = this.preprocessImage(mriPath);

            const input = {
                [this.inputName]: imageTensor
            };

            const predictions = model.predict(input);
            const result = await predictions.array(); // convert tensor to JS array
            return result[0]; // ambil array hasil pertama
        } catch (error) {
            console.error('Prediction error:', error);
            throw error;
        }
    }

    preprocessImage(imagePath) {
        const buffer = fs.readFileSync(imagePath);
        let tensor = tf.node.decodeImage(buffer, 3);
        tensor = tf.image.resizeBilinear(tensor, [224, 224]);
        tensor = tensor.div(255.0).expandDims();
        return tensor;
    }
}

module.exports = new ModelLoader();
