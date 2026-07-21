const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
    
    // Auto-create tables if they don't exist
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        resume_url VARCHAR(500),
        resume_filename VARCHAR(255),
        resume_uploaded_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    const createInterviews = `
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        subject VARCHAR(255),
        difficulty VARCHAR(50),
        question TEXT,
        answer TEXT,
        score INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    db.query(createUsers, (err) => {
      if (err) console.error("❌ Error creating users table:", err);
      else {
        // Add resume columns if they don't exist
        const alterUsers = `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_url VARCHAR(500),
          ADD COLUMN IF NOT EXISTS resume_filename VARCHAR(255),
          ADD COLUMN IF NOT EXISTS resume_uploaded_at TIMESTAMP
        `;
        db.query(alterUsers, (err) => {
          if (err) console.log("ℹ Resume columns already exist or error:", err.message);
        });
        
        db.query(createInterviews, (err) => {
          if (err) console.error("❌ Error creating interviews table:", err);
          else console.log("✅ DB Tables Verified");
        });
      }
    });
  }
});

module.exports = db;