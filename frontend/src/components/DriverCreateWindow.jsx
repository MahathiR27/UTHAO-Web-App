import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";

const DriverCreateWindow = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    UserName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    carModel: "",
    carColor: "",
    licensePlate: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (
      !formData.fullName ||
      !formData.UserName ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.address ||
      !formData.carModel ||
      !formData.carColor ||
      !formData.licensePlate
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5001/api/signup/create-driver",
        formData
      );

      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
      console.error(err);
    }
  };

  return (
    <div className="card w-full max-w-2xl bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="text-2xl font-bold text-center mb-6">Driver Registration</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  name="UserName"
                  value={formData.UserName}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
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
                  placeholder="Enter password"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your address"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* Vehicle Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Vehicle Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <span className="label-text">Car Model</span>
                </label>
                <input
                  type="text"
                  name="carModel"
                  value={formData.carModel}
                  onChange={handleChange}
                  placeholder="e.g., Toyota Corolla"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Car Color</span>
                </label>
                <input
                  type="text"
                  name="carColor"
                  value={formData.carColor}
                  onChange={handleChange}
                  placeholder="e.g., Black"
                  className="input input-bordered w-full focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text">License Plate</span>
              </label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="Enter license plate number"
                className="input input-bordered w-full focus:outline-none"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6">
            Register as Driver
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="link link-primary text-sm"
            >
              Back to Signup Options
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverCreateWindow;
