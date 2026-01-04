import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { MapPin, User, Phone, ShoppingBag, Store, CheckCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const DriverActiveDeliveryWindow = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const fetchDeliveryDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5001/api/dashboard/delivery-status/${orderId}`,
          {
            headers: { token: token }
          }
        );
        
        const order = response.data.order;
        
        // Prepare delivery details with restaurant and menu item info
        const restaurant = order.restaurantId;
        const menuItemIndex = order.menuItemId.split('-').pop();
        
        setDelivery({
          _id: order._id,
          userId: order.userId,
          restaurantName: restaurant?.RestaurantName || 'Unknown Restaurant',
          restaurantAddress: restaurant?.address || '',
          restaurantPhone: restaurant?.phone || '',
          menuItemName: 'Food Order', // We'll get this from restaurant menu if needed
          price: order.price,
          deliveryAddress: order.deliveryAddress,
          status: order.status,
          orderedAt: order.createdAt,
          acceptedAt: order.acceptedAt
        });
      } catch (error) {
        console.error("Error fetching delivery details:", error);
        toast.error("Failed to load delivery details");
        navigate("/driver-dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchDeliveryDetails();
    }
  }, [orderId, navigate]);

  const handleCompleteDelivery = async () => {
    try {
      setCompleting(true);
      const token = localStorage.getItem("token");
      
      await axios.put(
        "http://localhost:5001/api/dashboard/complete-delivery",
        { orderId },
        { headers: { token: token } }
      );
      
      toast.success("Delivery completed successfully!");
      navigate("/driver-dashboard");
    } catch (error) {
      console.error("Error completing delivery:", error);
      toast.error(error.response?.data?.message || "Failed to complete delivery");
      setCompleting(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString([], { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Active Delivery</h1>
        <div className="flex justify-center items-center h-64">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Active Delivery</h1>
        <div className="bg-base-100 rounded-lg p-8 text-center">
          <p className="text-lg text-base-content/60">No active delivery found.</p>
          <button 
            onClick={() => navigate("/driver-dashboard")}
            className="btn btn-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate("/driver-dashboard")}
          className="btn btn-ghost btn-circle"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold">Active Delivery</h1>
      </div>

      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <div className="badge badge-lg badge-warning gap-2">
            <ShoppingBag size={16} />
            Delivering
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User size={20} />
            Customer Information
          </h2>
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-12">
                  <span className="text-xl">
                    {delivery.userId?.fullName?.charAt(0) || "U"}
                  </span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {delivery.userId?.fullName || "Unknown User"}
                </p>
                <p className="text-sm text-base-content/60 flex items-center gap-1">
                  <Phone size={14} />
                  {delivery.userId?.phone || "No phone"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Restaurant Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Store size={20} />
            Pickup Location
          </h2>
          <div className="bg-base-200 rounded-lg p-4">
            <p className="font-semibold text-lg mb-2">{delivery.restaurantName}</p>
            <p className="text-base-content/70 mb-2">{delivery.restaurantAddress}</p>
            {delivery.restaurantPhone && (
              <p className="text-sm text-base-content/60 flex items-center gap-1">
                <Phone size={14} />
                {delivery.restaurantPhone}
              </p>
            )}
          </div>
        </div>

        <div className="divider"></div>

        {/* Order Details */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <ShoppingBag size={20} />
            Order Details
          </h2>
          <div className="bg-base-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Food Order</p>
                <p className="text-sm text-base-content/60">Ordered at: {formatTime(delivery.orderedAt)}</p>
                <p className="text-sm text-base-content/60">Accepted at: {formatTime(delivery.acceptedAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">৳{delivery.price}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* Delivery Address */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin size={20} />
            Delivery Address
          </h2>
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-lg">{delivery.deliveryAddress}</p>
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleCompleteDelivery}
          disabled={completing}
          className="btn btn-success w-full gap-2 btn-lg"
        >
          {completing ? (
            <>
              <span className="loading loading-spinner"></span>
              Completing...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Complete Delivery
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DriverActiveDeliveryWindow;
