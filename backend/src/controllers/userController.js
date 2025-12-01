import User from "../modules/userReg.js";

export const createUser = async (req, res) => {
    try {
        
        const { UserName, email, password, phone, address } = req.body;

        if (!UserName || !email || !password || !phone) {
            return res.status(400).json({message: "All fields are required"});
        }

        // Phone must be exactly 11 digits
        if (typeof phone !== 'string' || phone.replace(/\D/g, '').length !== 11) {
            return res.status(400).json({ message: 'Phone number must be exactly 11 digits' });
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

        const allowed = ["UserName", "email", "phone", "address", "password"];
        allowed.forEach((k) => {
            if (Object.prototype.hasOwnProperty.call(updates, k)) user[k] = updates[k];
        });

        await user.save();
        return res.status(200).json({ message: "User updated", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// all user controller functions are included above
