import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const RestaurantCreateWindow = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    RestaurantName: "",
    OwnerName: "",
    description: "",
    address: "",
    email: "",
    RestaurantPhone: "",
    OwnerPhone: "",
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
        "http://localhost:5001/api/signup/create-restaurant",
        formData
      );

      toast.success("Restaurant Registered Successfully");

      // extract id from backend response structure: { message, restaurant: { _id, ... } }
      const restaurantId = res?.data?.restaurant?._id;

      if (!restaurantId) {
        console.warn("Create restaurant response missing id:", res?.data);
        toast.error("Could not find created restaurant id in response");
        return;
      }

      // reset form then navigate to dashboard for created restaurant
      setFormData({
        username: "",
        password: "",
        RestaurantName: "",
        OwnerName: "",
        description: "",
        address: "",
        email: "",
        RestaurantPhone: "",
        OwnerPhone: "",
      });

      navigate(`/restaurant-dashboard?id=${restaurantId}`);

      
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register restaurant");
      console.error(err);
    }
  };

  return (
    <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">
          Register a Restaurant
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="card bg-base-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Account</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="label"><span className="label-text">Username</span></label>
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
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
                  placeholder="Set a password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-bordered w-full focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Restaurant Name</span>
            </label>
            <input
              type="text"
              name="RestaurantName"
              placeholder="Enter restaurant name"
              value={formData.RestaurantName}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Owner Name</span>
            </label>
            <input
              type="text"
              name="OwnerName"
              placeholder="Enter owner name"
              value={formData.OwnerName}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              placeholder="Enter restaurant description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full focus:outline-none"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter restaurant address"
              value={formData.address}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Restaurant Email</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter restaurant email"
              value={formData.email}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Restaurant Phone</span>
            </label>
            <input
              type="text"
              name="RestaurantPhone"
              placeholder="Enter restaurant phone"
              value={formData.RestaurantPhone}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Owner Phone</span>
            </label>
            <input
              type="text"
              name="OwnerPhone"
              placeholder="Enter owner phone (optional)"
              value={formData.OwnerPhone}
              onChange={handleChange}
              className="input input-bordered w-full focus:outline-none"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Create Restaurant
          </button>
        </form>
      </div>
    </div>
  );
};

export default RestaurantCreateWindow;
