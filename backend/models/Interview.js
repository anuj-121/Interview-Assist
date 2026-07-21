const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  answerText: { type: String, default: "" },
  score: { type: Number, default: 0 },
  keyImprovements: { type: [String], default: [] },
  detailedFeedback: { type: [String], default: [] }
});

const interviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, default: "Medium" },
  questions: { type: [String], default: [] },
  answers: { type: [answerSchema], default: [] },
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Interview", interviewSchema);
