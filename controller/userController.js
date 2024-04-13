const User = require("../models/User");
const generate = require("../middleware/generateToken");
const generateToken = require("../middleware/generateToken");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

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

    const id = req.user._id;

    const posts = await User.findById(id).populate("posts");

    res.status(200).json({
      success: true,
      message: `Welcome ${user.name}`,
      user,
      posts: posts.posts.reverse(),
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

    const user = await User.findById(id).populate("posts");

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

const findFollowingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let posts = await Post.find({
      admin: {
        $in: user.followings,
      },
    })
      .populate("admin")
      .populate("likes")
      .populate("retweets");

    let index = [];
    for (let i = 0; i < posts.length; i++) {
      index.push(posts[i]);
    }

    res.status(200).json({
      success: true,
      posts: index.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchUser = async (req, res) => {
  try {
    const student = await User.find({
      $or: [
        { name: { $regex: req.params.key, $options: "i" } },
        { username: { $regex: req.params.key, $options: "i" } },
      ],
    });
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "NO students found",
      });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const UserStatus = async (req, res) => {
  try {
    const user = req.user;
    const { url } = req.body;
    if (!user) {
      res.status(400).json({
        success: false,
        message: "Please Login Again",
      });
    }

    if (!url) {
      res.status(404).json({
        success: false,
        message: "Please provide url",
      });
    }

    user.status = url;
    user.save();

    res.status(201).json({
      success: true,
      message: "Status updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Please provide post id",
      });
      return;
    }

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Please Login Again",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const data = user.posts.indexOf(id);
    user.posts.splice(data, 1);
    user.save();
    await post.deleteOne();

    res.status(201).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user = req.user;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Please provide post id",
      });
      return;
    }

    if (!comment) {
      res.status(401).json({
        success: false,
        message: "Please provide comment",
      });
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const newComment = await Comment.create({
      comment,
      user: user._id,
    });

    if (!newComment) {
      res.status(404).json({
        success: false,
        message: "Something went wrong",
      });
      return;
    }

    post.comments.push(newComment._id);
    post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const findCommentsById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Please provide post id",
      });
      return;
    }

    const post = await Post.findById(id).populate({
      path: "comments",
      populate: { path: "user" },
    });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Comments fetched successfully",
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const likeAndUnlike = async (req, res) => {
  try {
    const {id} = req.params
    const user = req.user

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Please provide post id",
      });
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const index = post.likes.indexOf(user._id);

    if(index === -1){
      post.likes.push(user._id)
      post.save()

      res.status(201).json({
        success: true,
        message: "Liked successfully",
      })
      return;
    }

    post.likes.splice(index, 1)
    post.save()

    res.status(201).json({
      success: true,
      message: "Unliked successfully",
    })
    return;

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

const retweet = async (req, res) => {
  try {
    const {id} = req.params
    const user = req.user

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Please provide post id",
      });
      return;
    }

    const post = await Post.findById(id);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const index = post.retweets.indexOf(user._id);

    if(index === -1){
      post.retweets.push(user._id)
      post.save()

      res.status(201).json({
        success: true,
        message: "Retweeted successfully",
      })
      return;
    }

    post.retweets.splice(index, 1)
    post.save()

    res.status(201).json({
      success: true,
      message: "Unretweeted successfully",
    })
    return;

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
  findAllPosts,
  findFollowingPosts,
  searchUser,
  UserStatus,
  deletePost,
  commentOnPost,
  findCommentsById,
  likeAndUnlike,
  retweet
};
