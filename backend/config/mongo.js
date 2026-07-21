const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const fallbackUri = "mongodb://localhost:27017/interviewassist";

const finalUri = (typeof uri === "string" && uri.startsWith("mongodb")) ? uri : fallbackUri;

mongoose.connect(finalUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ MongoDB connected");
  if (!uri || !uri.startsWith("mongodb")) {
    console.log(`Using fallback local MongoDB URI: ${fallbackUri}`);
  }
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

module.exports = mongoose;
