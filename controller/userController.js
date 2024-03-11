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

    const token = generateToken(user._id);

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

const myProfile = async (req, res) => {
  try {
    const user = req?.user;
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please Login Again",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: `Welcome ${user.name}`,
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

const editProfile = async (req, res) => {
  try {
    const user = req?.user;
    const { avatar, name, bio } = req.body;
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Please Login Again",
      });
      return;
    }

    const existing = await User.findOne({ _id: user._id });
    if (!existing) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (avatar) {
      user.avatar = avatar;
    }

    if (name) {
      user.name = name;
    }

    if (bio) {
      user.bio = bio;
    }

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

const fetchAllUser = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

const fetchUserId = async (req, res) => {
  try {
    const {id} = req.params;

    if(!id){
      res.status(401).json({
        success: false,
        message: "Please provide user id",
      });
      return;
    }

    const user = await User.findById(id);

    if(!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
  myProfile,
  editProfile,
  fetchAllUser,
  fetchUserId
};
