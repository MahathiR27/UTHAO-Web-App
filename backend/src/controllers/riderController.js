import Rider from "../modules/riderReg.js";

export const createRider = async (req, res) => {
  try {
    const { name, email, password, phone, vehicle, licensePlate, username } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "name, phone and password are required" });
    }

    // enforce 11-digit phone
    if (typeof phone !== 'string' || phone.replace(/\D/g, '').length !== 11) {
      return res.status(400).json({ message: 'Phone number must be exactly 11 digits' });
    }

    const newRider = new Rider({ name, email, password, phone, vehicle, licensePlate, username, address: req.body.address });
    await newRider.save();

    return res.status(201).json({ message: "Rider created", rider: newRider });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getRider = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Rider id required" });

    const rider = await Rider.findById(id).lean();
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    return res.status(200).json({ rider });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!id) return res.status(400).json({ message: "Rider id required" });

    const rider = await Rider.findById(id);
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    const allowed = ["name", "username", "email", "phone", "vehicle", "licensePlate", "password"];
    allowed.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates, k)) rider[k] = updates[k];
    });

    await rider.save();
    return res.status(200).json({ message: "Rider updated", rider });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateRiderRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    if (!id) return res.status(400).json({ message: "Rider id required" });
    const r = Number(rating);
    if (Number.isNaN(r) || r < 0 || r > 5) return res.status(400).json({ message: "Invalid rating" });

    const rider = await Rider.findById(id);
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    // Keep cumulative and count so ratings can be averaged
    rider.ratingTotal = (rider.ratingTotal || 0) + r;
    rider.ratingCount = (rider.ratingCount || 0) + 1;
    rider.rating = rider.ratingCount ? rider.ratingTotal / rider.ratingCount : r;

    await rider.save();
    return res.status(200).json({ message: "Rider rating updated", rider });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
