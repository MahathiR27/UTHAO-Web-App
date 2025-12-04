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

export const createUser = async (req, res) => {
    try {
        
        const { UserName, email, password, phone, address } = req.body;

        if (!UserName || !email || !password || !phone) {
            return res.status(400).json({message: "All fields are required"});
        }

        const newUser = new User(
            {
                UserName, email, password, phone, address
            }
        );
        
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({message: "Server error"})
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "User id required" });

        const user = await User.findById(id).lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (!id) return res.status(400).json({ message: "User id required" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update allowed fields
        const allowed = ["UserName", "email", "phone", "address"];

        allowed.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                user[key] = updates[key];
            }
        });

        await user.save();
        return res.status(200).json({ message: "User updated", user });
      
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // Check default OTP
        if (otp === "000000") {
            // Get stored data
            const storedData = otpStore.get(email);

            if (!storedData) {
                return res.status(401).json({ message: "No OTP request found for this email" });
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

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, UserName: user.UserName, userType: storedData.userType },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Return success with token and user data based on type
            if (storedData.userType === "user") {
                return res.status(200).json({
                    message: "Login successful",
                    token,
                    userType: "user",
                    user: {
                        id: user._id,
                        UserName: user.UserName,
                        email: user.email,
                        phone: user.phone,
                        address: user.address
                    }
                });
            } else {
                return res.status(200).json({
                    message: "Login successful",
                    token,
                    userType: "restaurant",
                    user: {
                        id: user._id,
                        UserName: user.UserName,
                        RestaurantName: user.RestaurantName,
                        OwnerName: user.OwnerName,
                        email: user.email,
                        RestaurantPhone: user.RestaurantPhone,
                        address: user.address
                    }
                });
            }
        }

        // Check stored OTP
        const storedData = otpStore.get(email);

        if (!storedData) {
            return res.status(401).json({ message: "No OTP request found" });
        }

        // Verify OTP
        if (storedData.otp !== otp) {
            return res.status(401).json({ message: "Invalid OTP" });
        }

        // OTP verified, get user data
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

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, UserName: user.UserName, userType: storedData.userType },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token and user data based on type
        if (storedData.userType === "user") {
            return res.status(200).json({
                message: "Login successful",
                token,
                userType: "user",
                user: {
                    id: user._id,
                    UserName: user.UserName,
                    email: user.email,
                    phone: user.phone,
                    address: user.address
                }
            });
        } else {
            return res.status(200).json({
                message: "Login successful",
                token,
                userType: "restaurant",
                user: {
                    id: user._id,
                    UserName: user.UserName,
                    RestaurantName: user.RestaurantName,
                    OwnerName: user.OwnerName,
                    email: user.email,
                    RestaurantPhone: user.RestaurantPhone,
                    address: user.address
                }
            });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const generateRefId = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "User id required" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if refId already exists
        if (user.refId) {
            return res.status(400).json({ message: "Reference ID already exists", refId: user.refId });
        }

        // Generate unique reference ID
        const refId = `USR-${user._id}`;

        user.refId = refId;
        await user.save();

        return res.status(200).json({ message: "Reference ID generated successfully", refId: user.refId, user });
      
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

        // If not found in either collection
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Check password directly (no hashing)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Credentials validated, now prepare OTP step
        // Return success to show OTP screen, then send email
        const tempEmail = user.email;
        
        // Return to frontend first
        res.status(200).json({
            message: "Credentials verified",
            email: tempEmail,
            requiresOTP: true
        });

        // Now generate and send OTP after response is sent
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

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
