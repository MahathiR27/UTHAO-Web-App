import mongoose from "mongoose";

const rideRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userReg",
    required: true,
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driverReg",
    default: null,
  },
  from: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  to: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  distance: {
    type: Number, // in kilometers
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  price: {
    type: Number, // in BDT
    required: true,
  },
  status: {
    type: String,
    enum: ["requested", "accepted", "started", "completed", "cancelled"],
    default: "requested",
  },
  otp: {
    type: String,
    required: true,
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
});

export default mongoose.model("RideRequest", rideRequestSchema);
