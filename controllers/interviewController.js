const Interview = require("../models/Interview");
const ai = require("../ai/aiEngine");

exports.startInterview = async (req, res) => {
  const { userId, subject, difficulty, duration } = req.body;

  const interview = await Interview.create({
    userId,
    subject,
    difficulty,
    duration
  });

  res.json({
    success: true,
    interviewId: interview._id,
    question: ai.generateQuestion(subject)
  });
};

exports.submitAnswer = async (req, res) => {
  const { interviewId } = req.body;

  const result = ai.evaluateAnswer();

  await Interview.findByIdAndUpdate(interviewId, {
    score: result.score,
    feedback: result
  });

  res.json({
    success: true,
    message: "Answer evaluated"
  });
};

exports.getResult = async (req, res) => {
  const interview = await Interview.findById(req.params.id);

  res.json({
    success: true,
    score: interview.score,
    keyImprovements: interview.feedback.keyImprovements,
    detailedFeedback: interview.feedback.detailedFeedback
  });
};
