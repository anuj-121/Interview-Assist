const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subject: String,
  difficulty: String,
  duration: Number,

  question: String, // 🔥 important

  score: Number,
  feedback: {
    keyImprovements: [String],
    detailedFeedback: [String]
  }

}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);