const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const exerciseSchema = new mongoose.Schema({
    name: String,
    type: String,
    muscle: String,
    equipment: String,
    difficulty: String,
    instructions: String
});
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Please enter a username"],
        trim: true,
        minlength: [3, "Minimum username length is 3 characters"],
        maxlength: [10, "Maximum username length is 10 characters"]
    },
    password: {
        type: String,
        required: [true, "Must provide a password"],
        minlength: [4, "Minimum password length is 4 characters"]
    },
    fullName: {
        type: String,
        match: /^[a-zA-Z\s]+$/, 
        minlength: 3, 
        maxlength: 25
    },
    email:{
        type: String,
        unique: true,
        required: [true, "Please enter an email"],
        validate: [isEmail, "Please enter a valid email"]
    },
    bio: {
        type: String,
        maxlength: [150, "Maximum bio length is 150 characters"] 
    },
    profileImage: {
        type: String, 
        default:  "/images/default.png"
    },
    gender:{
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer Not to Say'],
    },
    height:{
        type: Number,
    },
    weight:{
        type: Number,
    },
    favorites: [exerciseSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });;

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        const salt = 12; 
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
userSchema.statics.login = async function(username, password) {
    const user = await this.findOne({ username });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error("incorrect password");
    }
    throw Error("incorrect username");
};

module.exports = mongoose.model("User", userSchema);
