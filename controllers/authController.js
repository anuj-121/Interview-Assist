const User = require("../models/User");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  await User.create({ name, email, password });

  res.json({
    success: true,
    message: "User registered successfully"
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({
    success: true,
    message: "Login successful",
    userId: user._id
  });
};
