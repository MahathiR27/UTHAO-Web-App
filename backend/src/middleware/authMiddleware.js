import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.token;
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        req.user = jwt.verify(token, process.env.JWT_SECRET);
        req.token = token;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
