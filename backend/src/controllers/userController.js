import User from "../modules/userReg.js";

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
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
