import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "userReg" },
  origin: String,
  destination: String,
  fare: Number,
  status: { type: String, default: "requested" },
  createdAt: { type: Date, default: Date.now }
});

const riderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String },
  email: { type: String },
  address: { type: String },
  password: { type: String },
  phone: { type: String, required: true },
  vehicle: { type: String },
  licensePlate: { type: String },
  status: { type: String, enum: ["available", "busy"], default: "available" },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  ratingTotal: { type: Number, default: 0 },
  dailyEarnings: { type: Number, default: 0 },
  trips: { type: [tripSchema], default: [] }
});

const Rider = mongoose.model("riderReg", riderSchema);

export default Rider;
