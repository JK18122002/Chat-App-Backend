import jwt from "jsonwebtoken";

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is not defined in environment variables");
  throw new Error("JWT_SECRET is required for generating tokens");
}

// Generate JWT token
export const generateToken = (userId) => {
  if (!userId) {
    console.error("❌ Cannot generate token: userId is missing");
    return null;
  }

  try {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // 7 days
    );
  } catch (err) {
    console.error("❌ JWT generation error:", err);
    return null;
  }
};
