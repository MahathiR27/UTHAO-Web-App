import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Navigation, ArrowLeft, Car, Clock, Route } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

// ---------------------------------- Keep maps disabled ---------------------------------------
const ENABLE_MAPS = false;


const libraries = ["places"];
const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 23.8103, lng: 90.4125 };

const RideRequestWindow = () => {
  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: ENABLE_MAPS ? import.meta.env.VITE_MAPS_API : "",
    libraries,
  });

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [rideInfo, setRideInfo] = useState(null);

  useEffect(() => {
    if (!ENABLE_MAPS || !isLoaded || !map) return;

    navigator.geolocation?.getCurrentPosition((position) => {
      const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
      setPickupCoords(coords);
      setMapCenter(coords);
      map.setCenter(coords);

      new google.maps.Geocoder().geocode({ location: coords }, (results) => {
        if (results?.[0]) setPickup(results[0].formatted_address);
      });
    });

    const setupAutocomplete = (inputId, onPlaceSelect) => {
      const input = document.getElementById(inputId);
      if (!input) return;

      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "bd" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const coords = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
          onPlaceSelect(place.formatted_address || place.name, coords);
        }
      });
    };

    setupAutocomplete("pickup-input", (address, coords) => {
      setPickup(address);
      setPickupCoords(coords);
      map.panTo(coords);
    });

    setupAutocomplete("destination-input", (address, coords) => {
      setDestination(address);
      setDestinationCoords(coords);
      map.panTo(coords);
    });
  }, [isLoaded, map]);

  useEffect(() => {
    if (!ENABLE_MAPS || !pickupCoords || !destinationCoords) {
      setDirections(null);
      setRideInfo(null);
      return;
    }

    new google.maps.DirectionsService().route(
      { origin: pickupCoords, destination: destinationCoords, travelMode: google.maps.TravelMode.DRIVING },
      async (result, status) => {
        if (status === "OK") {
          setDirections(result);
          
          const leg = result.routes[0].legs[0];
          const distanceKm = leg.distance.value / 1000;
          const durationMinutes = leg.duration.value / 60;
          
          try {
            const fareResponse = await axios.post("http://localhost:5001/api/dashboard/calculate-fare", {
              distanceKm,
              durationMinutes
            });
            
            setRideInfo({
              distance: leg.distance.text,
              distanceKm,
              duration: leg.duration.text,
              durationMinutes,
              fare: fareResponse.data.totalFare
            });
          } catch (error) {
            // Fallback calculation if backend fails
            const fare = Math.round(50 + (distanceKm * 15) + (durationMinutes * 2));
            setRideInfo({
              distance: leg.distance.text,
              distanceKm,
              duration: leg.duration.text,
              durationMinutes,
              fare
            });
          }
        }
      }
    );
  }, [pickupCoords, destinationCoords]);

  // Check if pickup and destination are the same
  const isSameLocation = () => {
    if (pickupCoords && destinationCoords) {
      return pickupCoords.lat === destinationCoords.lat && pickupCoords.lng === destinationCoords.lng;
    }
    if (pickup && destination) {
      return pickup.trim().toLowerCase() === destination.trim().toLowerCase();
    }
    return false;
  };

  const handleRequestRide = async () => {
    if (!pickup || !destination) return toast.error("Please enter both pickup and destination");
    if (ENABLE_MAPS && (!pickupCoords || !destinationCoords)) return toast.error("Please select valid locations");
    if (isSameLocation()) return toast.error("Pickup and destination cannot be the same");
    if (!rideInfo) return toast.error("Please wait for route calculation");

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(atob(token.split('.')[1]));
      
      const response = await axios.post(
        "http://localhost:5001/api/dashboard/create-ride-request",
        {
          userId: user.id,
          from: {
            address: pickup,
            lat: pickupCoords.lat,
            lng: pickupCoords.lng
          },
          to: {
            address: destination,
            lat: destinationCoords.lat,
            lng: destinationCoords.lng
          },
          distance: rideInfo.distanceKm,
          duration: rideInfo.durationMinutes,
          price: rideInfo.fare
        },
        {
          headers: { token: token }
        }
      );

      toast.success("Ride requested! Finding nearby drivers...");
      // Navigate to ride status page
      navigate(`/ride-status/${response.data.rideRequest._id}`);
    } catch (error) {
      console.error("Error creating ride request:", error);
      toast.error(error.response?.data?.message || "Failed to create ride request");
    }
  };

  if (ENABLE_MAPS && !isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-base-300 via-base-200 to-base-300">
      <div className="w-[450px] bg-base-100 shadow-2xl overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Request a Ride</h1>
            <button onClick={() => navigate("/user-dashboard")} className="btn btn-circle btn-ghost">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          <div className="divider"></div>

          <div className="space-y-4">
            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-success" />
                  Pickup Location
                </span>
              </label>
              <input
                id="pickup-input"
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup location"
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text font-semibold flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-error" />
                  Destination
                </span>
              </label>
              <input
                id="destination-input"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Where to?"
                className="input input-bordered w-full"
              />
            </div>

            {/* Ride Info Card */}
            {rideInfo && (
              <div className="bg-base-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Route className="w-5 h-5 text-info" />
                    <span className="font-semibold">Distance</span>
                  </div>
                  <span className="text-lg">{rideInfo.distance}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <span className="font-semibold">Est. Time</span>
                  </div>
                  <span className="text-lg">{rideInfo.duration}</span>
                </div>
                
                <div className="divider my-1"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-success" />
                    <span className="font-bold">Estimated Fare</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">৳{rideInfo.fare}</span>
                </div>
              </div>
            )}

            <button onClick={handleRequestRide} className="btn btn-primary w-full">
              Request Ride
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {ENABLE_MAPS ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={15}
            onLoad={setMap}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
            }}
          >
            {pickupCoords && <Marker position={pickupCoords} label="P" />}
            {destinationCoords && <Marker position={destinationCoords} label="D" />}
            {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-base-200 flex items-center justify-center">
            <p className="text-base-content/50">Map disabled</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideRequestWindow;
