const User = require("../models/User");
const generate = require("../middleware/generateToken");
const generateToken = require("../middleware/generateToken");

const registerUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      res.status(401).json({
        success: false,
        message: "Please enter all required fields",
      });
      return;
    }

    const existingUser = await User.findOne({ username });
    const existingUser1 = await User.findOne({ email });


    if (existingUser || existingUser1) {
      res.status(401).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    const user = await User.create({ name, email, username, password });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not cerated",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(401).json({
        success: false,
        message: "Please enter all required fields",
      });
      return;
    }
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
      return;
    }

    if (user.password !== password) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
      return;
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
};
