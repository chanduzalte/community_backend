// routes/index.js
const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const memberRoutes = require("./memberRoutes");
const settingsRoutes = require("./settingsRoutes");
const tagsRoutes = require("./tagsRoutes");
const dayTableRoutes = require("./dayTableRoutes");
const faqsRoutes = require('./faqRoutes');
const dashboardRoutes = require("./dashboardRoutes");

// Define API routes for toys and rentals
router.use('/users', userRoutes);
router.use("/members", memberRoutes);
router.use("/settings", settingsRoutes);
router.use("/tags", tagsRoutes);
router.use("/days", dayTableRoutes);
router.use('/faqs', faqsRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;
