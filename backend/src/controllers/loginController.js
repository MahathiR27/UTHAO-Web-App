import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import jwt from "jsonwebtoken";
import { sendOTP } from "./emailService.js";

// In-memory OTP storage
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const login = async (req, res) => {
    try {
        const { UserName, password } = req.body;

        // Validate input
        if (!UserName || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // First, try to find in User collection
        let user = await User.findOne({ UserName });
        let userType = "user";

        // If not found in User, try Restaurant collection
        if (!user) {
            user = await Restaurant.findOne({ UserName });
            userType = "restaurant";
        }

        // If user not found or password mismatch
        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Credentials validated, now prepare OTP step
        const tempEmail = user.email;
        
        // Generate and send OTP
        const otp = generateOTP();
        
        // Store OTP with user info (no expiration)
        otpStore.set(tempEmail, {
            otp,
            userId: user._id,
            UserName: user.UserName,
            userType
        });

        // Try to send OTP to email (async, non-blocking)
        sendOTP(tempEmail, otp).catch(emailErr => {
            console.error("Email send failed:", emailErr);
        });

        // Always log OTP to console for development
        console.log(`Generated OTP for ${tempEmail}: ${otp}`);

        // Return to frontend to show OTP screen
        return res.status(200).json({
            message: "Credentials verified",
            email: tempEmail,
            requiresOTP: true
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "loginController => login() error" });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // Get stored data
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(401).json({ message: "No OTP request found" });
        }

        // Verify OTP (allow default OTP "000000" for development)
        if (otp !== "000000" && storedData.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // Find user to get full data
        let user;
        if (storedData.userType === "user") {
            user = await User.findById(storedData.userId);
        } else {
            user = await Restaurant.findById(storedData.userId);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete OTP after successful verification
        otpStore.delete(email);

        // Prepare user data for JWT based on type
        let userData;
        if (storedData.userType === "user") {
            userData = {
                id: user._id,
                UserName: user.UserName,
                email: user.email,
                phone: user.phone,
                address: user.address,
                userType: "user"
            };
        } else {
            userData = {
                id: user._id,
                UserName: user.UserName,
                RestaurantName: user.RestaurantName,
                OwnerName: user.OwnerName,
                email: user.email,
                RestaurantPhone: user.RestaurantPhone,
                address: user.address,
                userType: "restaurant"
            };
        }

        // Generate JWT token with complete user data
        const token = jwt.sign(
            userData,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token only
        return res.status(200).json({
            message: "Login successful",
            token
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "loginController => verifyOTP() error" });
    }
};
