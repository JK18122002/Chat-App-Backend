import mongoose from "mongoose";

// Message schema for chat messages
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String },
    image: { type: String }, // store Cloudinary URL or Base64
    seen: { type: Boolean, default: false },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Prevent OverwriteModelError in hot-reload environments
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
