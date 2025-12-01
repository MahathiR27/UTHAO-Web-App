import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const RiderCreateWindow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    vehicle: "",
    licensePlate: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validations
    if (!/^[0-9]{11}$/.test(formData.phone)) {
      return toast.error("Phone number must be exactly 11 digits");
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    try {
      const res = await axios.post(
        "http://localhost:5001/api/signup/create-rider",
        formData
      );

      toast.success("Rider Registered Successfully");
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        vehicle: "",
        licensePlate: "",
        address: "",
      });

      if (res.status === 201 && res.data?.rider?._id) {
        navigate(`/rider-profile?id=${res.data.rider._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register rider");
    }
  };

  return (
    <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">Register as Rider</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label"><span className="label-text">Full name</span></label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Email</span></label>
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
            <label className="label"><span className="label-text">Password</span></label>
            <input
              type="password"
              name="password"
              placeholder="Enter a password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Confirm Password</span></label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Phone</span></label>
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
            <label className="label"><span className="label-text">Vehicle</span></label>
            <input
              type="text"
              name="vehicle"
              placeholder="Vehicle make/model"
              value={formData.vehicle}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">Address</span></label>
            <input
              type="text"
              name="address"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <div>
            <label className="label"><span className="label-text">License Plate</span></label>
            <input
              type="text"
              name="licensePlate"
              placeholder="License plate (optional)"
              value={formData.licensePlate}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">Create Rider Account</button>
        </form>
      </div>
    </div>
  );
};

export default RiderCreateWindow;
