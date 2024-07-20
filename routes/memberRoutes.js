const express = require("express");
const router = express.Router();
const jwtAuthMiddleware = require("../middleware/jwtAuthMiddleware");
const memberController = require("../controllers/memberController");

router.get("/", jwtAuthMiddleware, memberController.fetchMembersPerPage);
router.delete("/delete/:id", jwtAuthMiddleware, memberController.deleteMember);
router.get("/details/:id", jwtAuthMiddleware, memberController.memberDetailsById);
router.get("/tokens/:id", jwtAuthMiddleware, memberController.fetchTokensPerPage);
router.get("/assignmembers", jwtAuthMiddleware, memberController.fetchTokensPerMemberPerPage)
router.get("/sh", jwtAuthMiddleware, memberController.fetchSendHelps);
router.post("/assign-send-help", jwtAuthMiddleware, memberController.assignSendHelp);
router.post("/change-status", jwtAuthMiddleware, memberController.changeMemberStatus);
router.post("/update/:id", jwtAuthMiddleware, memberController.updateMember);
router.post("/update-gh/:id", jwtAuthMiddleware, memberController.updateGH);
router.get("/gh/:id", jwtAuthMiddleware, memberController.fetchGetHelps);
router.post("/add-note", jwtAuthMiddleware, memberController.addNote);
router.get("/pin-enquiries", jwtAuthMiddleware, memberController.getPinEnquiries);
router.post("/sendPin", jwtAuthMiddleware, memberController.sendPins);

module.exports = router;
