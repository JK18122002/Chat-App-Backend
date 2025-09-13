import mongoose from "mongoose";

// User schema for authentication & profile
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // ensures no duplicate emails
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // basic password length validation
    },
    profilePic: {
      type: String,
      default: "", // can store Cloudinary URL
    },
    bio: {
      type: String,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Prevent OverwriteModelError during development
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
