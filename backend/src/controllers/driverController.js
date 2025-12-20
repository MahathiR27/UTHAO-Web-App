import Driver from "../modules/driverReg.js";
import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";

export const createDriver = async (req, res) => {
    try {
        const { fullName, UserName, email, password, phone, address, carModel, carColor, licensePlate } = req.body;

        if (!fullName || !UserName || !email || !password || !phone || !address || !carModel || !carColor || !licensePlate) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if username already exists in any collection
        const [existingUser, existingRestaurant, existingDriver] = await Promise.all([
            User.findOne({ UserName }),
            Restaurant.findOne({ UserName }),
            Driver.findOne({ UserName })
        ]);

        if (existingUser || existingRestaurant || existingDriver) {
            return res.status(400).json({ message: "Username already exists. Please choose a different username." });
        }

        const newDriver = new Driver({
            fullName,
            UserName,
            email,
            password,
            phone,
            address,
            carModel,
            carColor,
            licensePlate
        });
        
        await newDriver.save();

        return res.status(201).json({
            message: "Driver registered successfully",
            driver: newDriver
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getDriver = async (req, res) => {
    try {
        const driverId = req.user.id;

        const driver = await Driver.findById(driverId).lean();
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        return res.status(200).json({ driver });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateDriver = async (req, res) => {
    try {
        const driverId = req.user.id;
        const updates = req.body;

        const driver = await Driver.findById(driverId);
        if (!driver) return res.status(404).json({ message: "Driver not found" });

        const allowed = ["fullName", "UserName", "email", "phone", "address", "carModel", "carColor", "licensePlate"];

        allowed.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                driver[key] = updates[key];
            }
        });

        await driver.save();
        return res.status(200).json({ message: "Driver updated", driver });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
