import User from "../modules/userReg.js";
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

        // Find user by username
        const user = await User.findOne({ UserName });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Check password directly (no hashing)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, UserName: user.UserName },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success with token and user data
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                UserName: user.UserName,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
