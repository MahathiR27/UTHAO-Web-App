import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { getUser, getToken } from "../utils/authUtils";

const DriverDashboardWindow = () => {
  const navigate = useNavigate();
  const currentUser = getUser();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [activeRideId, setActiveRideId] = useState(null);
  const [driverRating, setDriverRating] = useState(null);
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

    let isMounted = true;

    const fetchDriver = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: "http://localhost:5001/api/dashboard/get-driver",
          headers: { token: getToken() }
        });
        
        if (!isMounted) return;
        setDriver(response.data.driver);
        
        // Fetch driver rating
        try {
          const ratingResponse = await axios.get(
            `http://localhost:5001/api/dashboard/driver-rating/${response.data.driver._id}`
          );
          if (isMounted) {
            setDriverRating(ratingResponse.data);
          }
        } catch (ratingError) {
          console.error("Failed to load driver rating:", ratingError);
          if (isMounted) {
            setDriverRating({ averageRating: 0, totalRatings: 0 });
          }
        }
        
        // Check for active ride
        try {
          const activeRideResponse = await axios({
            method: 'get',
            url: "http://localhost:5001/api/dashboard/get-driver-active-ride",
            headers: { token: getToken() }
          });
          
          if (isMounted && activeRideResponse.data.activeRide) {
            setActiveRideId(activeRideResponse.data.activeRide._id);
          }
        } catch (rideError) {
          // Silently handle no active rides
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to load driver details");
          console.error(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDriver();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleActiveRides = () => {
    if (activeRideId) {
      navigate(`/driver-active-ride/${activeRideId}`);
    } else {
      navigate('/driver-ride-requests');
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

          <h3 className="text-2xl font-bold text-center mb-6">
            {driver.fullName || driver.UserName}
          </h3>

          {/* Driver Rating Display */}
          {driverRating && (
            <div className="bg-base-300 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(driverRating.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">
                  {driverRating.averageRating > 0
                    ? driverRating.averageRating.toFixed(1)
                    : '0.0'}
                </span>
              </div>
              <p className="text-center text-sm text-gray-500">
                {driverRating.totalRatings} rating{driverRating.totalRatings !== 1 ? 's' : ''} from riders
              </p>
            </div>
          )}

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

          <div className="flex justify-center">
            <button className="btn btn-primary" onClick={handleActiveRides}>
              {activeRideId ? "View Active Ride" : "View Ride Requests"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardWindow;
