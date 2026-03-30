const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",        // तुझा MySQL password
  database: "interview_ai"
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Connection Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

module.exports = db;