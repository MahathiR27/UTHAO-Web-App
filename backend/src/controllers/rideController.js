// Simple fare calculation for rides
import RideRequest from "../modules/rideRequestSchema.js";

import {sendRideCompletionEmail} from './emailService.js';

// Generate 4-digit OTP for ride verification
const generateRideOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Base fare: 50 BDT
// Per km: 15 BDT
// Per minute: 2 BDT

export const calculateFare = (req, res) => {
  try {
    const { distanceKm, durationMinutes } = req.body;

    if (!distanceKm || !durationMinutes) {
      return res.status(400).json({ message: "Distance and duration are required" });
    }

    const baseFare = 50;
    const perKmRate = 15;
    const perMinuteRate = 2;

    const distanceFare = distanceKm * perKmRate;
    const timeFare = durationMinutes * perMinuteRate;
    const totalFare = Math.round(baseFare + distanceFare + timeFare);

    return res.status(200).json({
      baseFare,
      distanceFare: Math.round(distanceFare),
      timeFare: Math.round(timeFare),
      totalFare,
      breakdown: {
        base: `৳${baseFare}`,
        distance: `৳${Math.round(distanceFare)} (${distanceKm.toFixed(1)} km × ৳${perKmRate})`,
        time: `৳${Math.round(timeFare)} (${Math.round(durationMinutes)} min × ৳${perMinuteRate})`
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Create a new ride request
export const createRideRequest = async (req, res) => {
  try {
    const { userId, from, to, distance, duration, price } = req.body;

    if (!userId || !from || !to || !distance || !duration || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Generate OTP for ride verification
    const otp = generateRideOTP();

    const rideRequest = new RideRequest({
      userId,
      from,
      to,
      distance,
      duration,
      price,
      otp,
      status: "requested",
      requestedAt: new Date()
    });

    await rideRequest.save();

    return res.status(201).json({
      message: "Ride request created successfully",
      rideRequest
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all requested rides (for drivers)
export const getRequestedRides = async (req, res) => {
  try {
    const rides = await RideRequest.find({ status: "requested" })
      .populate("userId", "fullName phone")
      .sort({ requestedAt: -1 });

    return res.status(200).json(rides);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Accept a ride request
export const acceptRideRequest = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
      return res.status(400).json({ message: "Ride ID and Driver ID are required" });
    }

    const ride = await RideRequest.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride request not found" });
    }

    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Ride is no longer available" });
    }

    ride.driverId = driverId;
    ride.status = "accepted";
    ride.acceptedAt = new Date();

    await ride.save();

    return res.status(200).json({
      message: "Ride accepted successfully",
      ride
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get ride status by ride ID
export const getRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await RideRequest.findById(rideId)
      .populate("userId", "fullName phone")
      .populate("driverId", "fullName phone");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    return res.status(200).json(ride);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cancel a ride request
export const cancelRideRequest = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await RideRequest.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed ride" });
    }

    ride.status = "cancelled";
    await ride.save();

    return res.status(200).json({
      message: "Ride cancelled successfully",
      ride
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update ride status (for starting/completing rides)
export const updateRideStatus = async (req, res) => {
  try {
    const { rideId, status } = req.body;

    if (!rideId || !status) {
      return res.status(400).json({ message: "Ride ID and status are required" });
    }

    const validStatuses = ["requested", "accepted", "started", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const ride = await RideRequest.findById(rideId).populate("userId", "email fullName");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }


    ride.status = status;
    if (status === "completed") {
      ride.completedAt = new Date();
      await sendRideCompletionEmail(
        ride.userId.email,
        ride.userId.fullName,
        ride.price,
        ride.from.address,
        ride.to.address,
        ride.distance,
        Math.round(ride.duration),
        ride.completedAt.toLocaleString()
      );
    }

    await ride.save();

    return res.status(200).json({
      message: "Ride status updated successfully",
      ride
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
