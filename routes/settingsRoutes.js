// routes/settingsRoutes.js
const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");
const settingsController = require('../controllers/settingsController');

// Define API routes for settings
router.get("", jwtAuthMiddleware, settingsController.getSettings);
router.post("/create", jwtAuthMiddleware, settingsController.createSettings);
router.post("/update/:id", jwtAuthMiddleware, settingsController.updateSettings);
router.post("/delete/:id", jwtAuthMiddleware, settingsController.deleteSettings);

module.exports = router;
