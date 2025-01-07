const User = require("/Users/kiroragai/Desktop/Code/JS/Workout/backend/models/user.js");
const Workout = require("/Users/kiroragai/Desktop/Code/JS/Workout/backend/models/logWorkout.js");

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
    const name = req.query.name;

    try {
        const response = await axios.get('https://api.api-ninjas.com/v1/exercises', {
            params: { type, muscle, name },
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
exerciseRouter.post('/recentlyView', checkUser, async (req, res) => {
    const { exercise } = req.body;
    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({ message: "You must be logged in to manage recently viewed exercises" });
    }

    try {
        const exerciseIndex = user.recentlyView.findIndex(
            viewedExercise =>
                viewedExercise.name === exercise.name && viewedExercise.type === exercise.type
        );

        if (exerciseIndex !== -1) {
            user.recentlyView.splice(exerciseIndex, 1);
        }

        if (exercise && typeof exercise === 'object') {
            user.recentlyView.unshift(exercise);
            if (user.recentlyView.length > 10) {
                user.recentlyView.pop();
            }
            await user.save();
            return res.status(200).json({ message: "Exercise added to recently viewed" });
        } else {
            return res.status(400).json({ message: "Invalid exercise object" });
        }
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: "Failed to manage recently viewed exercises" });
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
exerciseRouter.get('/recentlyViewed', checkUser, async (req, res) => {
    const userId = res.locals.user;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ recentlyViewed: user.recentlyView });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Failed to add exercise to favorites' });
    }
});
exerciseRouter.post('/workouts', checkUser, async (req, res) => {
    const userId = res.locals.user;
    try {
        const workoutData = {
            user: userId,
            name: req.body.name,
            type: req.body.type,
            exercises: req.body.exercises,
            duration: req.body.duration,
            location: req.body.location,
            notes: req.body.notes,
            mood: req.body.mood,
            energyLevel: req.body.energyLevel,
            bodyweight: req.body.bodyweight
        };

        const workout = new Workout(workoutData);
        await workout.validate();
        const savedWorkout = await workout.save();
        res.status(201).json(savedWorkout);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to add exercise to favorites' });
    }
});
module.exports = exerciseRouter;
