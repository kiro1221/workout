const express = require('express');
const dotenv = require("dotenv").config();
const render = express.Router();

render.get('/', async (req, res) => {
    try {
        res.render("workouts");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/login', async (req, res) => {
    try {
        res.render("login");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/forgotPassword', async (req, res) => {
    try {
        res.render("forgotPass");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/changePassword', async (req, res) => {
    try {
        res.render("changePass");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/register', async (req, res) => {
    try {
        res.render("register");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/email', async (req, res) => {
    try {
        res.render("email");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/templates', async (req, res) => {
    try {
        res.render("templates");
    } catch (err) {
        res.status(400).json(err);
    }
})
render.get('/Log-Workout', async (req, res) => {
    try {
        res.render("Log-Workout");
    } catch (err) {
        res.status(400).json(err);
    }
})
module.exports = render;