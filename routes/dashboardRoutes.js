const express = require("express");
const router = express.Router();
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/counts", jwtAuthMiddleware, dashboardController.getDashboardCounts);

module.exports = router;