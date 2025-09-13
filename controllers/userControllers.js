import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// -------------------- Signup --------------------
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      userData: userObj,
      message: "Account created successfully",
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Login --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(userData._id);
    const userObj = userData.toObject();
    delete userObj.password;

    res.json({
      success: true,
      userData: userObj,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Check Auth --------------------
export const checkAuth = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userObj = typeof req.user.toObject === "function" ? req.user.toObject() : req.user;
    delete userObj.password;

    res.json({ success: true, user: userObj });
  } catch (error) {
    console.error("CheckAuth error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Update Profile --------------------
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, bio } = req.body;
    const userId = req.user._id;

    const updateData = { fullName, bio };

    // ✅ Upload profile pic safely
    if (profilePic && profilePic.startsWith("data:image/")) {
      try {
        const upload = await cloudinary.uploader.upload(profilePic, {
          folder: "profile_pics",
          overwrite: true,
          resource_type: "image",
        });
        updateData.profilePic = upload.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(400).json({ success: false, message: "Image upload failed" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    const userObj = updatedUser.toObject();
    delete userObj.password;

    res.json({
      success: true,
      user: userObj,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
