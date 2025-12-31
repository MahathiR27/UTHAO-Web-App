import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { getUser, getToken } from "../utils/authUtils";

const DriverDashboardWindow = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    UserName: "",
    email: "",
    phone: "",
    address: "",
    carModel: "",
    carColor: "",
    licensePlate: ""
  });

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    const fetchDriver = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: "http://localhost:5001/api/dashboard/get-driver",
          headers: { token: getToken() }
        });
        setDriver(response.data.driver);
      } catch (error) {
        toast.error("Failed to load driver details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [currentUser, navigate]);

  const handleToggleEditProfile = () => {
    if (!editingProfile) {
      setEditForm({
        fullName: driver.fullName || "",
        UserName: driver.UserName || "",
        email: driver.email || "",
        phone: driver.phone || "",
        address: driver.address || "",
        carModel: driver.carModel || "",
        carColor: driver.carColor || "",
        licensePlate: driver.licensePlate || ""
      });
    }
    setEditingProfile(!editingProfile);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios({
        method: 'put',
        url: "http://localhost:5001/api/dashboard/update-driver",
        data: editForm,
        headers: { token: getToken() }
      });
      setDriver(res.data.driver);
      setEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="card w-full max-w-6xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="card w-full max-w-6xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-4">Driver Dashboard</h2>
          <p className="text-center text-error">
            Failed to load driver data. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-6xl bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Driver Dashboard</h2>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={handleToggleEditProfile}
            >
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>
        </div>

        {editingProfile && (
          <form
            onSubmit={handleUpdateProfile}
            className="bg-base-200 p-4 rounded-lg mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  name="fullName"
                  value={editForm.fullName}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">User Name</span>
                </label>
                <input
                  name="UserName"
                  value={editForm.UserName}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <input
                  name="address"
                  value={editForm.address}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Car Model</span>
                </label>
                <input
                  name="carModel"
                  value={editForm.carModel}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Car Color</span>
                </label>
                <input
                  name="carColor"
                  value={editForm.carColor}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">
                  <span className="label-text">License Plate</span>
                </label>
                <input
                  name="licensePlate"
                  value={editForm.licensePlate}
                  onChange={handleEditFormChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        )}

        <div className="bg-base-200 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-24">
                <span className="text-3xl">
                  {driver.fullName ? driver.fullName.charAt(0).toUpperCase() : "D"}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-2">
            {driver.fullName || driver.UserName}
          </h3>

          {/* Driver Rating Display */}
          <div className="flex items-center justify-center mb-6 gap-2">
            <div className="rating rating-sm">
              {[1, 2, 3, 4, 5].map((star) => (
                <input
                  key={star}
                  type="radio"
                  name="rating-display"
                  className="mask mask-star-2 bg-warning"
                  checked={Math.round(driver.rating || 0) === star}
                  readOnly
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-warning">
              {driver.rating ? driver.rating.toFixed(1) : "0.0"}
            </span>
            <span className="text-sm text-base-content opacity-60">
              ({driver.numberOfRatings || 0} {driver.numberOfRatings === 1 ? 'rating' : 'ratings'})
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <div className="font-semibold w-32">Username:</div>
              <div className="flex-1">{driver.UserName}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-32">Email:</div>
              <div className="flex-1">{driver.email}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-32">Phone:</div>
              <div className="flex-1">{driver.phone}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-32">Address:</div>
              <div className="flex-1">{driver.address}</div>
            </div>
          </div>

          <div className="divider">Vehicle Information</div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <div className="font-semibold w-32">Car Model:</div>
              <div className="flex-1">{driver.carModel}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-32">Car Color:</div>
              <div className="flex-1">{driver.carColor}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-32">License Plate:</div>
              <div className="flex-1">{driver.licensePlate}</div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex justify-center gap-4">
            <button className="btn btn-primary">View Delivery Requests</button>
            <button className="btn btn-outline">Active Deliveries</button>
            <button className="btn btn-outline">Earnings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardWindow;
