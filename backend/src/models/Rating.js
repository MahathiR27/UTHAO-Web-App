import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index to prevent duplicate ratings from same user to same driver
ratingSchema.index({ driverId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;
