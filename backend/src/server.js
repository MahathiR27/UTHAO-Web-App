import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaurantRoutes.js";

dotenv.config(); // Initializing the .env naile you cant access anything from that file

console.log("=================== Server Starting =====================");
const app = express();
app.use(express.json()); //Give access to req.body; Middleware - used for auth check; Ratelimiter - used to control how many time one can send api request.

app.use("/api/signup", restaurantRoutes);

connectDB().then(() => {
  app.listen(5001, () => {
    console.log("Server started on: http://localhost:5001/");
  });
});