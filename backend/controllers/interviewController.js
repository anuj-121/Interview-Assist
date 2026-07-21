const db = require("../config/db");
const ai = require("../ai/aiEngine");

// ================= START INTERVIEW =================
exports.startInterview = async (req, res) => {
  try {

    const { subject, difficulty } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // 🔥 SAFE QUESTION ARRAY
    let questions = [
      `Explain ${subject} (${difficulty})`,
      `What are the advantages of ${subject}?`,
      `Describe a real-world use case for ${subject}.`,
      `What are the common pitfalls when working with ${subject}?`,
      `Can you give an example of optimizing ${subject}?`,
      `What are the security considerations for ${subject}?`,
      `How would you test a system involving ${subject}?`,
      `What are the latest trends or updates in ${subject}?`,
      `How does ${subject} handle scalability?`,
      `Describe the architecture of a ${subject} application.`
    ];

    try {
      const aiQs = await ai.generateQuestions(subject, difficulty);
      if (aiQs && aiQs.length === 10) questions = aiQs;
    } catch (err) {
      console.log("AI failed, fallback array used");
    }

    const [result] = await db.promise().query(
      "INSERT INTO interviews (user_id, subject, difficulty, question, answer, score) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, subject, difficulty, JSON.stringify(questions), JSON.stringify([]), 0]
    );

    res.json({
      success: true,
      interviewId: result.insertId,
      questions // send array explicitly to frontend
    });

  } catch (err) {
    console.error("START ERROR:", err);
    res.status(500).json({ success: false });
  }
};


// ================= SUBMIT ANSWER =================
exports.submitAnswer = async (req, res) => {
  try {

    const { interviewId, answer, questionIndex } = req.body;

    const [rows] = await db.promise().query(
      "SELECT user_id, question, answer, score FROM interviews WHERE id = ? AND user_id = ?",
      [interviewId, req.user?.id]
    );

    if(rows.length === 0){
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const dbQuestions = JSON.parse(rows[0].question || "[]");
    const dbAnswers = JSON.parse(rows[0].answer || "[]");
    
    // Evaluate answer using the current index's question
    const currentQuestionText = dbQuestions[questionIndex];
    let evalResult;

    try {
      evalResult = await ai.evaluateAnswer(currentQuestionText, answer);
    } catch {
      evalResult = { score: 70, keyImprovements: ["N/A"], detailedFeedback: ["N/A"] }; 
    }

    // Add this answer object
    dbAnswers.push({
      answerText: answer,
      score: evalResult.score,
      keyImprovements: evalResult.keyImprovements || [],
      detailedFeedback: evalResult.detailedFeedback || []
    });

    const isComplete = dbAnswers.length >= dbQuestions.length;
    
    // Compute average score 
    const sumScore = dbAnswers.reduce((sum, item) => sum + item.score, 0);
    const avgScore = isComplete ? Math.round(sumScore / dbAnswers.length) : Math.round(sumScore / dbAnswers.length);

    await db.promise().query(
      "UPDATE interviews SET answer = ?, score = ? WHERE id = ?",
      [JSON.stringify(dbAnswers), avgScore, interviewId]
    );

    res.json({
      success: true,
      isComplete,
      result: evalResult, // Just returning the current evaluation so we can display it or skip
      totalScore: avgScore,
      allAnswers: dbAnswers // Can be parsed dynamically for final result page
    });

  } catch (err) {
    console.error("SUBMIT ERROR:", err);
    res.status(500).json({ success: false });
  }
};


// ================= GET RESULT =================
exports.getResult = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user?.id;

    const [rows] = await db.promise().query(
      "SELECT score, answer FROM interviews WHERE id = ? AND user_id = ?",
      [interviewId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Interview not found" });
    }

    const answers = JSON.parse(rows[0].answer || "[]");

    res.json({
      success: true,
      score: rows[0].score || 0,
      allAnswers: answers
    });

  } catch (err) {
    console.error("RESULT ERROR:", err);
    res.status(500).json({ success: false });
  }
};


// ================= GET DASHBOARD =================
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    const [rows] = await db.promise().query(
      "SELECT id, subject, score, created_at FROM interviews WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    let total = rows.length;
    let lastScore = rows.length > 0 ? rows[0].score : 0;
    
    res.json({
      success: true,
      total,
      lastScore,
      history: rows
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ success: false });
  }
};

// ================= GET HISTORY =================
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const [rows] = await db.promise().query(
      "SELECT id, subject, difficulty, score, created_at FROM interviews WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      success: true,
      history: rows
    });

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ success: false });
  }
};