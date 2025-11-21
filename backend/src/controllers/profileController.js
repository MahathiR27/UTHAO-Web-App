import User from "../models/User.js";
import Rating from "../models/Rating.js";
import mongoose from "mongoose";

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If user is a driver, calculate average rating
    let averageRating = null;
    let totalReviews = 0;
    let recentReviews = [];

    if (user.role === "driver") {
      const ratings = await Rating.find({ driverId: userId })
        .populate("userId", "name profilePicture")
        .sort({ createdAt: -1 });

      totalReviews = ratings.length;

      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        averageRating = (sum / ratings.length).toFixed(1);
        recentReviews = ratings.slice(0, 5);
      }
    }

    res.json({
      user,
      averageRating: averageRating ? parseFloat(averageRating) : null,
      totalReviews,
      recentReviews,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, address, vehicleInfo, licenseNumber } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Driver-specific fields
    if (vehicleInfo !== undefined) updateData.vehicleInfo = vehicleInfo;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Upload/Update profile picture
export const updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Update user profile picture path
    const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePicture: profilePicturePath } },
      { new: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ error: "Server error" });
  }
};

