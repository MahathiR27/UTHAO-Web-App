import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";

const LoginWindow = () => {
  const [formData, setFormData] = useState({
    UserName: "",
    password: ""
  });

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.UserName || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/user/login", formData);
      
      // Check if OTP is required
      if (res.data.requiresOTP) {
        setUserEmail(res.data.email);
        setOtpStep(true);
        // Don't show toast yet, wait for OTP screen to be visible
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/api/user/verify-otp", {
        email: userEmail,
        otp
      });

      // Store token
      localStorage.setItem("token", res.data.token);

      // Decode token to get user data
      const token = res.data.token;
      const payload = JSON.parse(atob(token.split('.')[1]));

      toast.success(res.data.message);

      // Navigate based on user type
      if (payload.userType === "user") {
        navigate("/user-dashboard");
      } else if (payload.userType === "restaurant") {
        navigate("/restaurant-dashboard");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        {!otpStep ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="UserName"
                value={formData.UserName}
                onChange={handleChange}
                placeholder="Enter your username"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>

            <div className="text-right">
              <a href="#" className="link link-primary text-sm">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text">Enter OTP</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="_ _ _ _ _ _"
                maxLength="6"
                className="input input-bordered w-full focus:outline-none text-center text-lg tracking-[0.5em]"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Verify OTP
            </button>

            <button 
              type="button" 
              onClick={() => {
                setOtpStep(false);
                setOtp("");
              }}
              className="btn btn-ghost w-full"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginWindow;
