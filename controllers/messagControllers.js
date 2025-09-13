import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

// -------------------- Get Users for Sidebar --------------------
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const users = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};
    await Promise.all(
      users.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          seen: false,
        });
        unseenMessages[user._id] = count || 0;
      })
    );

    res.json({ success: true, users, unseenMessages });
  } catch (error) {
    console.error("getUsersForSidebar error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- Get Messages --------------------
export const getMessages = async (req, res) => {
  try {
    const selectedUserId = req.params.id;
    const myId = req.user?._id;
    if (!myId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true }
    );

    const senderSocketId = userSocketMap[selectedUserId];
    if (senderSocketId) io.to(senderSocketId).emit("messagesSeen", { by: myId });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- Mark Message As Seen --------------------
export const markMessageAsSeen = async (req, res) => {
  try {
    const messageId = req.params.id;
    await Message.findByIdAndUpdate(messageId, { seen: true });
    res.json({ success: true });
  } catch (error) {
    console.error("markMessageAsSeen error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- Send Message --------------------
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user?._id;
    if (!senderId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let imageUrl = null;

    // Upload image if provided
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_images",
          resource_type: "image",
          overwrite: true,
        });
        imageUrl = uploadResponse.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(400).json({ success: false, message: "Image upload failed" });
      }
    }

    const newMessage = await Message.create({ senderId, receiverId, text, image: imageUrl });

    // Emit to receiver via socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) io.to(receiverSocketId).emit("newMessage", newMessage);

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
