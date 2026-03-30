const fetch = require("node-fetch");

// 🔥 Generate Question
exports.generateQuestion = async (subject, difficulty = "Medium") => {
  try {
    const prompt = `Ask 1 ${difficulty} level interview question on ${subject}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (err) {
    console.error("AI Error:", err);
    return "Error generating question";
  }
};


// 🔥 Evaluate Answer
exports.evaluateAnswer = async (question, answer) => {
  try {
    const prompt = `
    Evaluate this answer.

    Question: ${question}
    Answer: ${answer}

    Return JSON:
    {
      "score": number,
      "keyImprovements": [],
      "detailedFeedback": []
    }
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    try {
      return JSON.parse(text);
    } catch {
      return {
        score: 75,
        keyImprovements: ["Improve clarity"],
        detailedFeedback: ["Parsing fallback"]
      };
    }

  } catch (err) {
    console.error("Evaluation Error:", err);
    return {
      score: 70,
      keyImprovements: ["Error occurred"],
      detailedFeedback: ["Try again"]
    };
  }
};