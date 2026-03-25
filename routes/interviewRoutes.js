const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  getResult
} = require("../controllers/interviewController");

router.post("/start", startInterview);
router.post("/answer", submitAnswer);
router.get("/result/:id", getResult);

module.exports = router;
