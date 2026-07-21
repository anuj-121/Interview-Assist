const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profileController");

router.get("/profile/:userId", profileController.getProfile);
router.post("/profile/:userId/resume", profileController.uploadResume);
router.delete("/profile/:userId/resume", profileController.deleteResume);
router.put("/profile/:userId", profileController.updateProfile);

module.exports = router;
