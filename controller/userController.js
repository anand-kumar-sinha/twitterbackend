const User = require("../models/User");
const generate = require("../middleware/generateToken");
const generateToken = require("../middleware/generateToken");
const Post = require("../models/Post");

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
    const { id } = req.params;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Please provide user id",
      });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
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
};

const followUser = async (req, res) => {
  try {
    const userFollow = await User.findById(req.params.id);
    const loggedUser = await User.findById(req.user._id);

    if (loggedUser._id === userFollow._id) {
      return res.status(401).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    if (!userFollow) {
      return res.status(404).json({
        success: false,
        message: "User doest not exists",
      });
    }

    //checking user is already followed or not
    if (loggedUser.followings.includes(userFollow._id)) {
      const indexfollowing = loggedUser.followings.indexOf(userFollow._id);
      const indexfollower = userFollow.followers.indexOf(loggedUser._id);

      loggedUser.followings.splice(indexfollowing, 1);
      userFollow.followers.splice(indexfollower, 1);

      await loggedUser.save();
      await userFollow.save();

      return res.status(200).json({
        success: true,
        message: "User unfollowed",
      });
    }

    loggedUser.followings.push(userFollow._id);
    userFollow.followers.push(loggedUser._id);

    await loggedUser.save();
    await userFollow.save();

    res.status(201).json({
      success: true,
      message: "Follow successfull",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error,
    });
  }
};

const createPost = async (req, res) => {
  try {
    const newPost = {
      desc: req.body.desc,
      postImg: req.body.postImg,
      admin: req.user._id,
    };

    if (!newPost.desc) {
      return res.status(400).json({
        success: false,
        message: "Please enter post description",
      });
    }

    const user = await User.findById(req.user._id);

    const post = await Post.create(newPost);

    user.posts.push(post._id);
    user.save();

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const findAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({}).populate("admin", "-password");

    if (!posts) {
      return res.status(404).json({
        success: false,
        message: "No posts found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  myProfile,
  editProfile,
  fetchAllUser,
  fetchUserId,
  followUser,
  createPost,
  findAllPosts
};
