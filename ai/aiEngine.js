exports.generateQuestion = (subject) => {
  return `Explain core concepts of ${subject}`;
};

exports.evaluateAnswer = () => {
  return {
    score: Math.floor(Math.random() * 30) + 70,
    keyImprovements: [
      "Improve answer structure",
      "Add real-world examples",
      "Reduce hesitation",
      "Be more concise"
    ],
    detailedFeedback: [
      "Good fundamentals",
      "Confidence is decent",
      "Time management can improve",
      "Clarity is acceptable"
    ]
  };
};
