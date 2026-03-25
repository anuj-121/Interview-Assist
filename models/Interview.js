const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  subject: String,
  difficulty: String,
  duration: Number,
  score: Number,
  feedback: Object
}, { timestamps: true });

module.exports = mongoose.model("Interview", interviewSchema);
