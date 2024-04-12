const mongoose = require("mongoose");

const commentModel = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "Please write a comment"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", commentModel);

module.exports = Comment;
