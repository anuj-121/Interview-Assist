const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "InterviewAssistSecretKey";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads/resumes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ================= VERIFY TOKEN =================
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.id != userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [users] = await db.promise().query(
      "SELECT id, name, email, resume_url, resume_filename, resume_uploaded_at, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      resume: user.resume_url ? {
        url: user.resume_url,
        filename: user.resume_filename,
        uploadedAt: user.resume_uploaded_at
      } : null
    });

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPLOAD RESUME =================
exports.uploadResume = async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.id != userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.files || !req.files.resume) {
      return res.status(400).json({ success: false, message: "No resume file provided" });
    }

    const file = req.files.resume;

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({ success: false, message: "File size exceeds 5MB limit" });
    }

    // Validate file type
    const allowedMimes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: "Invalid file type. Only PDF and DOC/DOCX allowed" });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `resume_${userId}_${timestamp}${path.extname(file.name)}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    await file.mv(filepath);

    // Save resume info to database
    const resumeUrl = `/uploads/resumes/${filename}`;
    const uploadedAt = new Date();

    await db.promise().query(
      "UPDATE users SET resume_url = ?, resume_filename = ?, resume_uploaded_at = ? WHERE id = ?",
      [resumeUrl, file.name, uploadedAt, userId]
    );

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      resume: {
        url: resumeUrl,
        filename: file.name,
        uploadedAt: uploadedAt
      }
    });

  } catch (err) {
    console.error("UPLOAD RESUME ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DELETE RESUME =================
exports.deleteResume = async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.id != userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get current resume URL
    const [users] = await db.promise().query(
      "SELECT resume_url FROM users WHERE id = ?",
      [userId]
    );

    if (users.length > 0 && users[0].resume_url) {
      const filename = path.basename(users[0].resume_url);
      const filepath = path.join(uploadsDir, filename);

      // Delete file from filesystem
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    // Remove resume from database
    await db.promise().query(
      "UPDATE users SET resume_url = NULL, resume_filename = NULL, resume_uploaded_at = NULL WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Resume deleted successfully"
    });

  } catch (err) {
    console.error("DELETE RESUME ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.id != userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Update user info
    await db.promise().query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, userId]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: { id: userId, name, email }
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
