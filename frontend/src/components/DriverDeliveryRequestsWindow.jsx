import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapPin, User, Phone, Clock, Check, RefreshCw, ShoppingBag, Store } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getUser } from "../utils/authUtils";

const DriverDeliveryRequestsWindow = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveryRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5001/api/dashboard/get-available-deliveries",
        {
          headers: { token: token }
        }
      );
      setDeliveries(response.data);
    } catch (error) {
      console.error("Error fetching delivery requests:", error);
      toast.error("Failed to fetch delivery requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryRequests();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDeliveryRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptDelivery = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      const user = getUser();
      
      await axios.post(
        "http://localhost:5001/api/dashboard/accept-delivery",
        { orderId, driverId: user.id },
        { headers: { token: token } }
      );
      
      toast.success("Delivery accepted!");
      // Navigate to active delivery page
      navigate(`/driver-active-delivery/${orderId}`);
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error(error.response?.data?.message || "Failed to accept delivery");
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Available Delivery Requests</h1>
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Available Delivery Requests</h1>
        <button 
          onClick={fetchDeliveryRequests} 
          className="btn btn-ghost btn-circle"
          title="Refresh"
        >
          <RefreshCw size={20} />
        </button>
      </div>
      
      {deliveries.length === 0 ? (
        <div className="bg-base-100 rounded-lg p-8 text-center">
          <p className="text-lg text-base-content/60">No delivery requests available at the moment.</p>
          <p className="text-sm text-base-content/40 mt-2">New requests will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <div key={delivery._id} className="bg-base-100 rounded-lg shadow-lg p-5">
              {/* Customer Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content rounded-full w-12">
                      <span className="text-xl">
                        {delivery.userId?.fullName?.charAt(0) || "U"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold flex items-center gap-2">
                      <User size={16} />
                      {delivery.userId?.fullName || "Unknown User"}
                    </p>
                    <p className="text-sm text-base-content/60 flex items-center gap-2">
                      <Phone size={14} />
                      {delivery.userId?.phone || "No phone"}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-base-content/50 flex items-center gap-1">
                  <Clock size={14} />
                  {formatTime(delivery.orderedAt)}
                </span>
              </div>

              {/* Restaurant Info */}
              <div className="bg-base-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <Store className="w-5 h-5 text-info mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-base-content/60">Pickup from</p>
                    <p className="font-semibold">{delivery.restaurantName}</p>
                    <p className="text-sm text-base-content/70">{delivery.restaurantAddress}</p>
                    {delivery.restaurantPhone && (
                      <p className="text-sm text-base-content/60 flex items-center gap-1 mt-1">
                        <Phone size={12} />
                        {delivery.restaurantPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-base-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <ShoppingBag className="w-5 h-5 text-success mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-base-content/60">Order Item</p>
                    <p className="font-semibold">{delivery.menuItemName}</p>
                    {delivery.menuItemDescription && (
                      <p className="text-sm text-base-content/60 mt-1">{delivery.menuItemDescription}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-error mt-0.5" />
                  <div>
                    <p className="text-xs text-base-content/60">Delivery Address</p>
                    <p className="font-medium">{delivery.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-base-content/60">Order Amount</span>
                <span className="text-xl font-bold text-primary">৳{delivery.price}</span>
              </div>

              {/* Accept Button */}
              <button
                onClick={() => handleAcceptDelivery(delivery._id)}
                className="btn btn-success w-full gap-2"
              >
                <Check size={18} />
                Accept Delivery
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDeliveryRequestsWindow;
