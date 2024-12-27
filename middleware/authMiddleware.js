const jwt = require('jsonwebtoken');
const User = require('../models/user');

const secret = process.env.JWT_SECRET || 'default_secret_key'; // Fallback for non-production

// Utility function for verifying tokens
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err) {
                reject(err);
            } else {
                resolve(decodedToken);
            }
        });
    });
};

// Middleware to protect routes
const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
    }

    try {
        const decodedToken = await verifyToken(token);
        req.user = { id: decodedToken.id };
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

const checkUser = async (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        res.locals.user = null;
        return next();
    }
    try {
        const decodedToken = await verifyToken(token);
        const user = await User.findById(decodedToken.id).select('-password -sensitiveField1'); // Exclude sensitive fields
        res.locals.user = user || null;
    } catch (err) {
        console.error('Error in checkUser middleware:', err.message);
        res.locals.user = null;
    }
    next();
};

module.exports = { checkUser, requireAuth };
