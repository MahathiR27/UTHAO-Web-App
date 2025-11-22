import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const RestaurantCreatePage = () => {

  const [formData, setFormData] = useState({
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
      const res = await axios.post("http://localhost:5001/api/signup/create-restaurant",formData);

      toast.success("Restaurant Registered Successfully")

      console.log(res.data)

      setFormData({
        RestaurantName: "",
        OwnerName: "",
        description: "",
        address: "",
        email: "",
        RestaurantPhone: "",
        OwnerPhone: "",
      });

    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to register restaurant")
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Register a Restaurant
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="RestaurantName"
            placeholder="Restaurant Name"
            value={formData.RestaurantName}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-200 text-black"
            required
          />

          <input
            type="text"
            name="OwnerName"
            placeholder="Owner Name"
            value={formData.OwnerName}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-200 text-black"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full bg-gray-200 text-black"
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-200 text-black"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Restaurant Email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-200 text-black"
            required
          />

          <input
            type="text"
            name="RestaurantPhone"
            placeholder="Restaurant Phone"
            value={formData.RestaurantPhone}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-200 text-black"
            required
          />

          <input
            type="text"
            name="OwnerPhone"
            placeholder="Owner Phone"
            value={formData.OwnerPhone}
            onChange={handleChange}
            className="input input-bordered w-full bg-gray-200 text-black"
          />

          <button
            type="submit"
            className="btn btn-primary w-full mt-4 bg-gray-200 text-black"
          >
            Create Restaurant
          </button>
        </form>
      </div>
    </div>

  )
};

export default RestaurantCreatePage;
