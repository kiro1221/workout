const User = require("/Users/kiroragai/Desktop/Code/JS/Workout/backend/models/user.js");
const { checkUser, authMiddleware } = require('/Users/kiroragai/Desktop/Code/JS/Workout/backend/middleware/authMiddleware');
const { passwordChangeConfirmation, changePasswordRequest } = require('/Users/kiroragai/Desktop/Code/JS/Workout/backend/mailer.js');
const express = require('express');
const dotenv = require("dotenv").config();
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const secret = process.env.JWT_SECRET;

const sessionLength = 5 * 24 * 60 * 60; //3 days
const createToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: sessionLength
    });
};

const handleErrors = err => {
    console.log(err.message, err.code);
    let errors = { password: "", username: "", email: "" };
    if (err.message === "incorrect username") {
        errors.username = "Incorrect username";
    }

    if (err.message === "incorrect password") {
        errors.password = "Incorrect password";
    }
    if (err.message === "incorrect email") {
        errors.email = "Incorrect email";
    }
    if (err.message === "Passwords do not match") {
        errors.password = "Passwords do not match";
    }
    if (err.code === 11000) {
        const duplicateField = Object.keys(err.keyValue)[0];
        if (duplicateField === "username") {
            errors.username = "Username already taken";
        }
        return errors;
    }

    if (err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
};

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        if (confirmPassword && password !== confirmPassword) {
            throw Error("Passwords do not match");
        }
        const user = new User({ username, email, password });
        await user.save()
        if (!user) { res.status(404).json({ message: "Error creating user" }) }
        res.status(201).json(user);
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
})
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.login(username, password);
        const token = createToken(user._id);
        res.cookie("jwt", token, { httpOnly: true, maxAge: sessionLength * 1000 });
        res.status(201).json({ user: user._id, message: token, username: user.username });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
})
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');  // Clear JWT cookie
    res.redirect('/render/login'); 
});
router.post('/change-password', checkUser, async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword.length <= 4 || newPassword !== confirmPassword) {
        return res.status(400).json({
            message: "New password must be at least 4 characters and match confirmation"
        });
    }
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect old password" });
        }
        user.password = newPassword;
        await user.save();
        passwordChangeConfirmation(user.email, user.username);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
});
router.get('/user', checkUser, async (req, res) => {
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(200).json(null);
        }
        res.status(200).json(user);
    } catch (err) {
        console.error('Error in user route:', err.message);
        const errors = handleErrors(err) || { message: 'Unexpected error occurred' };
        res.status(400).json({ errors });
    }
});
router.post('/forgot-password', async (req, res) => {
    const { newPassword, confirmPassword,token } = req.body;
    if (newPassword.length <= 4 || newPassword !== confirmPassword) {
        return res.status(400).json({
            message: "New password must be at least 4 characters and match confirmation"
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        // const email = 'kiroragai2@gmail.com'; //TODO:WITH FRONT END, GET ACTUAL EMAIL
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // changePasswordRequest(user.email, user.username);
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
});
router.post('/changePasswordRequest', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    try{
        changePasswordRequest(email);
        res.status(200).json({ message: 'Password change request email sent' });
    }catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to send email' });
    }
})
module.exports = router;