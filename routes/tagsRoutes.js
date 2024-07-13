const express = require("express");
const router = express.Router();
const tagsController = require("../controllers/tagsController");
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");

router.get("/", jwtAuthMiddleware, tagsController.getAllTags);
router.post("/", jwtAuthMiddleware, tagsController.createTag);
router.put("/:id", jwtAuthMiddleware, tagsController.updateTag);
router.delete("/:id", jwtAuthMiddleware, tagsController.deleteTag);

module.exports = router;
