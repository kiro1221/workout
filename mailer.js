const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config();
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  
}});
const changePasswordRequest = (userEmail) => {
    const token = jwt.sign({ email: userEmail }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `http://localhost:9001/render/forgotPassword?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Password Change Notification',
        text: `Hello,\n\nTo change your password visit http://localhost:9001/render/forgotPassword ${resetLink}`
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};
const passwordChangeConfirmation = (userEmail, userName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Password Change Notification',
        text: `Hello ${userName},\n\nYour password has been changed successfully.`
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log('Error sending email:', err);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

module.exports = { passwordChangeConfirmation,changePasswordRequest };
