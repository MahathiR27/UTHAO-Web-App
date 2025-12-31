import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { MapPin, Navigation, Clock, Route, Car, X, Shield, User, Phone, CheckCircle, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const RideStatusWindow = () => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRideStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/dashboard/ride-status/${rideId}`,
        { headers: { token: token } }
      );
      setRide(response.data);
    } catch (error) {
      console.error("Error fetching ride status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideStatus();
    const interval = setInterval(fetchRideStatus, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  const handleCancelRide = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/dashboard/cancel-ride/${rideId}`,
        {},
        { headers: { token: token } }
      );
      toast.success("Ride cancelled");
      navigate("/ride-request");
    } catch (error) {
      toast.error("Failed to cancel ride");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <p className="text-xl mb-4">Ride not found</p>
        <button onClick={() => navigate("/ride-request")} className="btn btn-primary">
          Request New Ride
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-4">
        {/* Status Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Ride Status</h1>
          <div className={`badge badge-lg ${
            ride.status === "requested" ? "badge-warning" :
            ride.status === "accepted" ? "badge-success" :
            ride.status === "started" ? "badge-info" :
            ride.status === "cancelled" ? "badge-error" : "badge-primary"
          }`}>
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
          </div>
        </div>

        {/* Waiting for Driver */}
        {ride.status === "requested" && (
          <div className="bg-base-100 rounded-xl p-6 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-warning border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="w-10 h-10 text-warning" />
              </div>
            </div>
            <p className="font-semibold">Finding a Driver...</p>
            <p className="text-sm text-base-content/60">Please wait</p>
          </div>
        )}

        {/* Driver Accepted - Show OTP */}
        {ride.status === "accepted" && (
          <div className="bg-base-100 rounded-xl p-6">
            <div className="text-center mb-4">
              <Car className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="font-semibold text-success">Driver Found!</p>
            </div>
            
            {ride.driverId && (
              <div className="flex items-center gap-3 bg-base-200 rounded-lg p-3 mb-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10">
                    <span>{ride.driverId.fullName?.charAt(0) || "D"}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{ride.driverId.fullName || "Driver"}</p>
                  <p className="text-xs text-base-content/60">{ride.driverId.phone || "N/A"}</p>
                </div>
              </div>
            )}

            <div className="bg-success/10 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-base-content/60 mb-1">
                <Shield size={14} />
                Your OTP
              </div>
              <div className="text-3xl font-bold tracking-[0.5em] text-success">
                {ride.otp}
              </div>
              <p className="text-xs text-base-content/50 mt-1">Share with driver to start ride</p>
            </div>
          </div>
        )}

        {/* Ride Started */}
        {ride.status === "started" && (
          <div className="bg-base-100 rounded-xl p-6 text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <Car className="w-10 h-10 text-info absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute inset-0 border-4 border-info border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-semibold text-info">Ride in Progress</p>
            <p className="text-sm text-base-content/60">Enjoy your ride!</p>
          </div>
        )}

        {/* Completed - Show Payment */}
        {ride.status === "completed" && (
          <div className="bg-base-100 rounded-xl p-6">
            <div className="text-center mb-4">
              <CheckCircle className="w-14 h-14 text-success mx-auto mb-3" />
              <p className="text-xl font-bold text-success">Ride Completed!</p>
              <p className="text-sm text-base-content/60">Thank you for riding with us</p>
            </div>
            
            <div className="bg-primary/10 rounded-xl p-6 text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Banknote className="w-5 h-5 text-primary" />
                <span className="text-sm text-base-content/60">Amount to Pay</span>
              </div>
              <p className="text-4xl font-bold text-primary">৳{ride.price}</p>
              <p className="text-xs text-base-content/50 mt-2">Please pay the driver</p>
            </div>

            {ride.driverId && (
              <div className="flex items-center gap-3 bg-base-200 rounded-lg p-3 mb-4">
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-10">
                    <span>{ride.driverId.fullName?.charAt(0) || "D"}</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{ride.driverId.fullName || "Driver"}</p>
                  <p className="text-xs text-base-content/60">{ride.driverId.phone || "N/A"}</p>
                </div>
              </div>
            )}

            <button onClick={() => navigate("/user-dashboard")} className="btn btn-primary w-full">
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Cancelled */}
        {ride.status === "cancelled" && (
          <div className="bg-base-100 rounded-xl p-6 text-center">
            <X className="w-10 h-10 text-error mx-auto mb-2" />
            <p className="font-semibold text-error">Ride Cancelled</p>
            <button onClick={() => navigate("/ride-request")} className="btn btn-primary btn-sm mt-3">
              Request New Ride
            </button>
          </div>
        )}

        {/* Ride Details - Hide when completed */}
        {ride.status !== "completed" && (
          <div className="bg-base-100 rounded-xl p-4">
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-success mt-0.5" />
                <div>
                  <p className="text-xs text-base-content/60">Pickup</p>
                  <p className="text-sm">{ride.from?.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-error mt-0.5" />
                <div>
                  <p className="text-xs text-base-content/60">Destination</p>
                  <p className="text-sm">{ride.to?.address}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-base-300">
              <span className="text-sm flex items-center gap-1">
                <Route size={14} className="text-info" />
                {ride.distance?.toFixed(1)} km
              </span>
              <span className="text-sm flex items-center gap-1">
                <Clock size={14} className="text-warning" />
                {Math.round(ride.duration)} min
              </span>
              <span className="font-bold text-primary">৳{ride.price}</span>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {(ride.status === "requested" || ride.status === "accepted") && (
          <button onClick={handleCancelRide} className="btn btn-error btn-outline w-full gap-2">
            <X size={16} />
            Cancel Ride
          </button>
        )}
      </div>
    </div>
  );
};

export default RideStatusWindow;
