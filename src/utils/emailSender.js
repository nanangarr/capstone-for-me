const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendPasswordEmail = (email, username, password) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Aktivasi Akun Stroke Detection System',
        html: `
        <h2>Aktivasi Akun Berhasil</h2>
        <p>Berikut adalah kredensial untuk akun Anda:</p>
        <table>
          <tr><td>Username</td><td><b>${username}</b></td></tr>
          <tr><td>Password</td><td><b>${password}</b></td></tr>
        </table>
        <p>Silakan login menggunakan kredensial di atas.</p>
      `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordEmail };