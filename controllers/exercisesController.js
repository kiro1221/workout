const User = require("/Users/kiroragai/Desktop/Code/JS/Workout/backend/models/user.js");
const { checkUser, authMiddleware } = require('/Users/kiroragai/Desktop/Code/JS/Workout/backend/middleware/authMiddleware');
const { passwordChangeConfirmation, changePasswordRequest } = require('/Users/kiroragai/Desktop/Code/JS/Workout/backend/mailer.js');
const express = require('express');
const dotenv = require("dotenv").config();
const exerciseRouter = express.Router();
const axios = require('axios');


const handleErrors = err => {
    console.error(err);
    return { message: "An error occurred" };
};
exerciseRouter.get('/exercises', async (req, res) => {
    const muscle = req.query.muscle;
    const type = req.query.type;
    try {
        const response = await axios.get('https://api.api-ninjas.com/v1/exercises', {
            params: { type, muscle },
            headers: {
                'X-Api-Key': process.env.API_KEY
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            console.error('Error:', error.response.status, error.response.data);
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            console.error('Request failed:', error.message);
            res.status(500).json({ error: 'Request failed' });
        }
    }
});
exerciseRouter.post('/favorite', checkUser, async (req, res) => {
    const { exercise } = req.body;
    const user = res.locals.user; 
    
    if (!user) {
        return res.status(401).json({ message: "You must be logged in to manage favorites" });
    }

    try {
        const exerciseIndex = user.favorites.findIndex(
            favExercise =>
                favExercise.name === exercise.name && favExercise.type === exercise.type
        );

        if (exerciseIndex !== -1) {
            user.favorites.splice(exerciseIndex, 1)
            await user.save();
            return res.status(200).json({ message: "Exercise removed from favorites" });
        } else {
            if (exercise && typeof exercise === 'object') {
                user.favorites.push(exercise); 
                await user.save();
                return res.status(200).json({ message: "Exercise added to favorites" });
            } else {
                return res.status(400).json({ message: "Invalid exercise object" });
            }
        }
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: "Failed to manage favorites" });
    }
});

exerciseRouter.get('/favorite', checkUser, async (req, res) => {
    const userId = res.locals.user;  
    try {
        const user = await User.findById(userId);  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ favorites: user.favorites });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to add exercise to favorites' });
    }
});
module.exports = exerciseRouter;
