import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // Add event listeners once
    mongoose.connection.on("connected", () =>
      console.log("✅ Database Connected")
    );
    mongoose.connection.on("error", (err) =>
      console.error("❌ DB connection error:", err)
    );
    mongoose.connection.on("disconnected", () =>
      console.warn("⚠️ Database Disconnected")
    );

    // `useNewUrlParser` and `useUnifiedTopology` are no longer needed in Mongoose 6+
    await mongoose.connect(process.env.MONGODB_URI);

  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};
