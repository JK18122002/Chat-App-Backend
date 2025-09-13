import jwt from "jsonwebtoken";
import User from "../models/User.js";

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined in environment variables");
  throw new Error("JWT_SECRET is required for authentication middleware");
}

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err.name === "TokenExpiredError"
        ? "Token expired, please login again"
        : "Invalid token";
      return res.status(401).json({ success: false, message });
    }

    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ success: false, message: "Server error in auth middleware" });
  }
};
