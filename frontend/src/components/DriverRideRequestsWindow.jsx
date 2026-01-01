import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapPin, Navigation, User, Phone, Clock, Route, Check, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getUser } from "../utils/authUtils";

const DriverRideRequestsWindow = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRideRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/api/dashboard/get-requested-rides",
        {
          headers: { token: token }
        }
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching ride requests:", error);
      toast.error("Failed to fetch ride requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRideRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");
      const user = getUser();
      
      await axios.post(
        "http://localhost:5001/api/dashboard/accept-ride",
        { rideId, driverId: user.id },
        { headers: { token: token } }
      );
      
      toast.success("Ride accepted!");
      // Navigate to active ride page
      navigate(`/driver-active-ride/${rideId}`);
    } catch (error) {
      console.error("Error accepting ride:", error);
      toast.error(error.response?.data?.message || "Failed to accept ride");
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Available Ride Requests</h1>
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Available Ride Requests</h1>
        <button 
          onClick={fetchRideRequests} 
          className="btn btn-ghost btn-circle"
          title="Refresh"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      
      {requests.length === 0 ? (
        <div className="bg-base-100 rounded-lg p-8 text-center">
          <p className="text-lg text-base-content/60">No ride requests available at the moment.</p>
          <p className="text-sm text-base-content/40 mt-2">New requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-base-100 rounded-lg shadow-lg p-5">
              {/* User Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-12">
                      <span className="text-xl">
                        {request.userId?.fullName?.charAt(0) || "U"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <User size={16} />
                      {request.userId?.fullName || "Unknown User"}
                    </p>
                    <p className="text-sm text-base-content/60 flex items-center gap-2">
                      <Phone size={14} />
                      {request.userId?.phone || "No phone"}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-base-content/50">
                  Requested at {formatTime(request.requestedAt)}
                </span>
              </div>

              {/* Locations */}
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="text-xs text-base-content/60">Pickup</p>
                    <p className="font-medium">{request.from?.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="w-5 h-5 text-error mt-0.5" />
                  <div>
                    <p className="text-xs text-base-content/60">Destination</p>
                    <p className="font-medium">{request.to?.address}</p>
                  </div>
                </div>
              </div>

              {/* Ride Info */}
              <div className="flex items-center gap-6 mb-4 text-sm">
                <span className="flex items-center gap-1">
                  <Route size={16} className="text-info" />
                  {request.distance?.toFixed(1)} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={16} className="text-warning" />
                  {Math.round(request.duration)} mins
                </span>
                <span className="text-xl font-bold text-primary">৳{request.price}</span>
              </div>

              {/* Accept Button */}
              <button
                onClick={() => handleAcceptRide(request._id)}
                className="btn btn-success w-full gap-2"
              >
                <Check size={18} />
                Accept Ride
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverRideRequestsWindow;
