const express = require("express");
const router = express.Router();
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");
const dayTableController = require("../controllers/dayTableController");

router.get("/", jwtAuthMiddleware, dayTableController.getDayTables);
router.post("/", jwtAuthMiddleware, dayTableController.createDayTable);
router.put("/:id", jwtAuthMiddleware, dayTableController.updateDayTable);
router.delete("/:id", jwtAuthMiddleware, dayTableController.deleteDayTable);

module.exports = router;
