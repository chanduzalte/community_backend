// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

// Define login route for users
router.post("/login", userController.loginUser);

// Defining the register route for user
router.post("/register", userController.registerUser);

// get user profile
router.get("/get-user-profile", jwtAuthMiddleware, userController.getUserProfile);

// update user password
router.post("/update-password", jwtAuthMiddleware, userController.updateUserPassword);

module.exports = router;
