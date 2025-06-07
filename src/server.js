// server.js
const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }) // Set true untuk reset database
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server berjalan di port ${PORT}`);
            console.log(`Database: ${process.env.DB_NAME}`);
        });
    })
    .catch(err => console.error('Gagal menyinkronkan database:', err));