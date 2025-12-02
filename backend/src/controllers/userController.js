import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import jwt from "jsonwebtoken";

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

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, UserName: user.UserName, userType },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token and user data based on type
        if (userType === "user") {
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
