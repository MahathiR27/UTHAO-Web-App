import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { GoogleMap, useLoadScript, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Navigation, Clock, Route, Car, User, Phone, Shield, Play, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const ENABLE_MAPS = true;
const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 23.8103, lng: 90.4125 };

const DriverActiveRideWindow = () => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: ENABLE_MAPS ? import.meta.env.VITE_MAPS_API : "",
    libraries,
  });

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);
  const [map, setMap] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const fetchRideDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5001/api/dashboard/ride-status/${rideId}`,
        { headers: { token: token } }
      );
      setRide(response.data);
    } catch (error) {
      console.error("Error fetching ride details:", error);
      toast.error("Failed to fetch ride details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  useEffect(() => {
    if (!ENABLE_MAPS || !isLoaded || !ride || !map) return;

    const pickupCoords = { lat: ride.from.lat, lng: ride.from.lng };
    const destinationCoords = { lat: ride.to.lat, lng: ride.to.lng };

    new google.maps.DirectionsService().route(
      { origin: pickupCoords, destination: destinationCoords, travelMode: google.maps.TravelMode.DRIVING },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, ride, map]);

  const handleStartRide = async () => {
    if (!otpInput) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otpInput !== ride.otp) {
      toast.error("Invalid OTP");
      return;
    }

    setStarting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/dashboard/update-ride-status`,
        { rideId, status: "started" },
        { headers: { token: token } }
      );
      toast.success("Ride started!");
      fetchRideDetails(); // Refresh to show updated status
    } catch (error) {
      console.error("Error starting ride:", error);
      toast.error("Failed to start ride");
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteRide = async () => {
    setCompleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/dashboard/update-ride-status`,
        { rideId, status: "completed" },
        { headers: { token: token } }
      );
      toast.success("Ride completed!");
      fetchRideDetails(); // Refresh to show completed status
    } catch (error) {
      console.error("Error completing ride:", error);
      toast.error("Failed to complete ride");
    } finally {
      setCompleting(false);
    }
  };

  if (loading || (ENABLE_MAPS && !isLoaded)) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <p className="text-xl mb-4">Ride not found</p>
        <button onClick={() => navigate("/driver-ride-requests")} className="btn btn-primary">
          Back to Ride Requests
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-base-200">
      {/* Left Panel */}
      <div className="w-[400px] bg-base-100 shadow-xl overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Active Ride</h1>
            <button onClick={() => navigate("/driver-ride-requests")} className="btn btn-circle btn-ghost btn-sm">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Customer Info */}
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12">
                  <span className="text-xl">{ride.userId?.fullName?.charAt(0) || "C"}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold">{ride.userId?.fullName || "Customer"}</p>
                <p className="text-sm text-base-content/60 flex items-center gap-1">
                  <Phone size={12} />
                  {ride.userId?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="text-xs text-base-content/60">Pickup</p>
                <p className="text-sm font-medium">{ride.from?.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="w-5 h-5 text-error mt-0.5" />
              <div>
                <p className="text-xs text-base-content/60">Destination</p>
                <p className="text-sm font-medium">{ride.to?.address}</p>
              </div>
            </div>
          </div>

          {/* Ride Info */}
          <div className="flex justify-between items-center bg-base-200 rounded-lg p-3">
            <span className="flex items-center gap-1 text-sm">
              <Route size={16} className="text-info" />
              {ride.distance?.toFixed(1)} km
            </span>
            <span className="flex items-center gap-1 text-sm">
              <Clock size={16} className="text-warning" />
              {Math.round(ride.duration)} min
            </span>
            <span className="text-lg font-bold text-primary">৳{ride.price}</span>
          </div>

          {/* Status-based Actions */}
          {ride.status === "accepted" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-base-content/60">
                <Shield size={16} className="text-warning" />
                Enter customer's OTP to start ride
              </div>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="_ _ _ _"
                className="input input-bordered w-full text-center text-2xl tracking-[0.5em] font-bold"
                maxLength={4}
              />
              <button
                onClick={handleStartRide}
                disabled={starting || otpInput.length !== 4}
                className="btn btn-success w-full gap-2"
              >
                {starting ? <span className="loading loading-spinner"></span> : <Play size={18} />}
                Start Ride
              </button>
            </div>
          )}

          {ride.status === "started" && (
            <div className="space-y-4">
              <div className="bg-info/10 border border-info rounded-lg p-4 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <Car className="w-12 h-12 text-info" />
                    <span className="loading loading-dots loading-sm text-info absolute -bottom-2 left-1/2 -translate-x-1/2"></span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-info">Ride in Progress</p>
                    <p className="text-sm text-base-content/60">Drive safely to the destination</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCompleteRide}
                disabled={completing}
                className="btn btn-primary w-full gap-2"
              >
                {completing ? <span className="loading loading-spinner"></span> : <CheckCircle size={18} />}
                Complete Ride
              </button>
            </div>
          )}

          {ride.status === "completed" && (
            <div className="space-y-4">
              <div className="bg-success/10 border border-success rounded-lg p-4 text-center">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="w-12 h-12 text-success" />
                  <div>
                    <p className="text-lg font-bold text-success">Ride Completed!</p>
                    <p className="text-sm text-base-content/60">Customer will pay</p>
                    <p className="text-3xl font-bold text-primary mt-2">৳{ride.price}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/driver-dashboard")}
                className="btn btn-outline w-full gap-2"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {ENABLE_MAPS ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={ride?.from ? { lat: ride.from.lat, lng: ride.from.lng } : defaultCenter}
            zoom={13}
            onLoad={setMap}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-base-200 flex items-center justify-center">
            <Car className="w-16 h-16 text-base-content/30" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverActiveRideWindow;
