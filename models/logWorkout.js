const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
    reps: {
        type: Number,
        required: true,
        min: 1,
    },
    weight: {
        type: Number,
        min: 0,
    },
    unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg'
    },
    rpe: {
        type: Number,
        min: 1,
        max: 10
    },
    notes: {
        type: String,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
});
const ExerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    // category: {
    //     type: String,
    //     enum: ['strength', 'cardio', 'flexibility', 'plyometric', 'other'],
    //     default: 'strength'
    // },
    // equipment: {
    //     type: String,
    //     trim: true
    // },
    // targetMuscles: [{
    //     type: String,
    //     trim: true
    // }],
    sets: {
        type: [SetSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Each exercise must have at least one set.'
        }
    },
    notes: {
        type: String,
        trim: true
    },
    restBetweenSets: {
        type: Number,  // in seconds
        min: 0
    }
});

// Main workout schema
const WorkoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    duration: {
        type: Number,  
        min: 0
    },
    location: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['strength', 'cardio', 'hiit', 'recovery', 'other'],
        default: 'strength'
    },
    exercises: {
        type: [ExerciseSchema],
        required: true,
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'Each workout must have at least one exercise.'
        }
    },
    notes: {
        type: String,
        trim: true
    },
    mood: {
        type: Number,  
        max: 5
    },
    energyLevel: {
        type: Number, 
        min: 1,
        max: 5
    },
    bodyweight: {
        value: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        }
    }
}, {
    timestamps: true
});

// // Add indexes for common queries???
// WorkoutSchema.index({ user: 1, date: -1 });
// WorkoutSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Workout', WorkoutSchema);


