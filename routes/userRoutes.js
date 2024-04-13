const express = require("express");
const { protect } = require("../middleware/Auth");
const {
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
  retweet,
} = require("../controller/userController");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/me").get(protect, myProfile);
router.route("/editprofile").put(protect, editProfile);
router.route("/allusers").get(protect, fetchAllUser);
router.route("/user/:id").get(protect, fetchUserId);
router.route("/follow/:id").get(protect, followUser);
router.route("/createpost").put(protect, createPost);
router.route("/allposts").get(protect, findAllPosts);
router.route("/following/posts").get(protect, findFollowingPosts);
router.route("/search/:key").get(protect, searchUser);
router.route("/add/status").post(protect, UserStatus);
router.route("/delete/:id").delete(protect, deletePost);
router.route("/comment/:id").post(protect, commentOnPost);
router.route("/comment/:id").get(protect, findCommentsById);
router.route("/like/:id").get(protect, likeAndUnlike);
router.route("/retweet/:id").get(protect, retweet);

module.exports = router;
