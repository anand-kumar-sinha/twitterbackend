const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter your email"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Please Enter your username"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please Enter your password"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userModel);

module.exports = User;
