const Interview = require("../models/Interview");
const ai = require("../ai/aiEngine");

// Start Interview
exports.startInterview = async (req, res) => {
  try {
    const { userId, subject, difficulty, duration } = req.body;

    const question = await ai.generateQuestion(subject, difficulty);

    const interview = await Interview.create({
      userId,
      subject,
      difficulty,
      duration,
      question
    });

    res.json({
      success: true,
      interviewId: interview._id,
      question
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error starting interview" });
  }
};


// Submit Answer
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;

    const interview = await Interview.findById(interviewId);

    const result = await ai.evaluateAnswer(interview.question, answer);

    await Interview.findByIdAndUpdate(interviewId, {
      score: result.score,
      feedback: result
    });

    res.json({
      success: true,
      result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Evaluation error" });
  }
};


// Get Result
exports.getResult = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    res.json({
      score: interview.score,
      keyImprovements: interview.feedback?.keyImprovements || [],
      detailedFeedback: interview.feedback?.detailedFeedback || []
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching result" });
  }
};