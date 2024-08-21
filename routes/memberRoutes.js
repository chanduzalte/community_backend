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
router.get("/get-container", jwtAuthMiddleware, memberController.fetchContainers);
router.post("/create-container", jwtAuthMiddleware, memberController.createContainer);
router.post("/publish-container", jwtAuthMiddleware, memberController.publishContainer);
router.post("/edit-container-note", jwtAuthMiddleware, memberController.editContainerNote);
router.get("/fetch-container-members/:id", jwtAuthMiddleware, memberController.fetchContainerMemberTokens);
router.post("/assign-send-help", jwtAuthMiddleware, memberController.assignSendHelp);
router.post("/change-status", jwtAuthMiddleware, memberController.changeMemberStatus);
router.post("/update/:id", jwtAuthMiddleware, memberController.updateMember);
router.post("/update-gh/:id", jwtAuthMiddleware, memberController.updateGH);
router.get("/gh/:id", jwtAuthMiddleware, memberController.fetchGetHelps);
router.post("/add-note", jwtAuthMiddleware, memberController.addNote);
router.get("/pin-enquiries", jwtAuthMiddleware, memberController.getPinEnquiries);
router.post("/sendPin", jwtAuthMiddleware, memberController.sendPins);
router.post("/unlock-freepin", jwtAuthMiddleware, memberController.unlockFreePin);
router.post("/reject-freepin", jwtAuthMiddleware, memberController.rejectFreePin);
router.get("/ids", jwtAuthMiddleware, memberController.fetchMembersIDs);

module.exports = router;
