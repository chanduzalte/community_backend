const express = require("express");
const router = express.Router();
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");
const faqController = require("../controllers/faqController");

router.get("/", jwtAuthMiddleware, faqController.getFAQs);
router.post("/", jwtAuthMiddleware, faqController.createFAQ);
router.put("/:id", jwtAuthMiddleware, faqController.updateFAQ);
router.delete("/:id", jwtAuthMiddleware, faqController.deleteFAQ);

module.exports = router;