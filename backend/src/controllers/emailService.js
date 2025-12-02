import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (email, otp) => {
    try {
        // Check if credentials are loaded
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Email credentials not loaded from .env");
            console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Set" : "Missing");
            console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Set" : "Missing");
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your Login OTP - UTHAO",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <p>Your OTP for login is: ${otp}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", email);
        return true;
    } catch (err) {
        console.error("Email send error:", err);
        return false;
    }
};
