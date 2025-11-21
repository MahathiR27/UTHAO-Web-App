import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Import routes
import profileRoutes from "./routes/profile.js";

dotenv.config(); // Initializing the .env naile you cant access anything from that file

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=================== Server Starting =====================");
const app = express();

// Middleware
app.use(express.json()); // Give access to req.body; Middleware - used for auth check; Ratelimiter - used to control how many time one can send api request.
app.use(cors()); // Enable CORS for frontend

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/profile", profileRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

connectDB().then(() => {
  app.listen(5001, () => {
    console.log("Server started on: http://localhost:5001/");
  });
});