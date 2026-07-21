const express = require("express");
const router = express.Router();

const {
  startInterview,
  submitAnswer,
  getResult,
  getDashboard,
  getHistory
} = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/start", authMiddleware, startInterview);
router.post("/submit", authMiddleware, submitAnswer);
router.get("/result/:id", authMiddleware, getResult);
router.get("/dashboard", authMiddleware, getDashboard);
router.get("/history", authMiddleware, getHistory);

module.exports = router;