import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const UserCreateWindow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    UserName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    referralCode: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5001/api/signup/create-user",
        formData
      );

      // Check if user received promocodes from referral
      if (res.data.promocodes && res.data.promocodes.length > 0) {
        toast.success(
          `🎉 Welcome! You received ${res.data.promocodes.length} promocodes! Check your dashboard after login.`,
          { duration: 5000 }
        );
      } else {
        toast.success("User Registered Successfully! Please login to continue.");
      }

      setFormData({
        UserName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        referralCode: "",
      });

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register user");
    }
  };

  return (
    <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">
          Register as User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">User Name</span>
            </label>
            <input
              type="text"
              name="UserName"
              placeholder="Enter your name"
              value={formData.UserName}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Phone</span>
            </label>
            <input
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter your address (optional)"
              value={formData.address}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Referral Code</span>
              <span className="label-text-alt text-xs text-base-content/60">Optional</span>
            </label>
            <input
              type="text"
              name="referralCode"
              placeholder="Enter referral code (optional)"
              value={formData.referralCode}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
            />
            <label className="label">
              <span className="label-text-alt text-xs text-base-content/60">
                💡 Have a referral code? Get 3 exclusive promocodes!
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Create User Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserCreateWindow;
