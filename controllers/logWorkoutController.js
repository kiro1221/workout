const express = require('express');
const dotenv = require("dotenv").config();
const logWorkout = express.Router();

// logWorkout.post('/log', checkUser, async (req, res) => {
//     const { exercises } = req.body; // Extract exercises from the request body
//     const user = res.locals.user;  // Extract user information from middleware

//     if (!user) {
//         return res.status(401).json({ message: "You must be logged in" });
//     }

//     if (!exercises || exercises.length === 0) {
//         return res.status(400).json({ message: "You must provide at least one exercise" });
//     }

//     try {
//         // Create a new workout document
//         const workout = new Workout({
//             user: user._id,
//             exercises,
//         });

//         // Save the workout to the database
//         const savedWorkout = await workout.save();

//         return res.status(201).json({
//             message: "Workout logged successfully",
//             workout: savedWorkout,
//         });
//     } catch (err) {
//         console.error('Error:', err);
//         return res.status(500).json({ error: "Failed to log workout" });
//     }
// });
