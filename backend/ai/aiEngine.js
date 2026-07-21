const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));


// ================= GENERATE MULTIPLE QUESTIONS =================
exports.generateQuestions = async (subject, difficulty = "Medium") => {
  try {
    const prompt = `
    Generate 10 ${difficulty} level interview questions on ${subject}.
    Return STRICTLY as a JSON array of strings and nothing else.
    Example: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10"]
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
    let text = data.choices[0].message.content.trim();

    try {
      const arr = JSON.parse(text);
      if (Array.isArray(arr)) return arr.slice(0, 10);
    } catch {
      // fallback
    }
    
    // In case parsing fails just split it lines
    return [
      `What are the core concepts of ${subject}?`,
      `Explain a challenging scenario involving ${subject}.`,
      `How does ${subject} compare to its alternatives?`,
      `What are the common pitfalls when working with ${subject}?`,
      `Can you give an example of optimizing ${subject}?`,
      `What are the security considerations for ${subject}?`,
      `How would you test a system involving ${subject}?`,
      `What are the latest trends or updates in ${subject}?`,
      `How does ${subject} handle scalability?`,
      `Describe the architecture of a ${subject} application.`
    ];

  } catch (err) {
    console.error("AI Question Error:", err);
    return null;
  }
};


// ================= EVALUATE ANSWER =================
exports.evaluateAnswer = async (question, answer) => {
  try {
    const prompt = `
    Evaluate this answer.

    Question: ${question}
    Answer: ${answer}

    Return STRICT JSON:
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