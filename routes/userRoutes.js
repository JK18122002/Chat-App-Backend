import express from "express";
import { signup, login, updateProfile, checkAuth } from "../controllers/userControllers.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Signup a new user
router.post("/signup", signup);

// Login an existing user
router.post("/login", login);

// Update user profile (protected route)
router.put("/update-profile", protectRoute, updateProfile);

// Check authentication / get current user info (protected route)
router.get("/check", protectRoute, checkAuth);

export default router;
