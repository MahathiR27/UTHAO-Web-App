import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Star } from "lucide-react";
import { getUser, getToken } from "../utils/authUtils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const UserDashboardWindow = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const hasShownNotification = useRef(false);
  const hasFetchedPromos = useRef(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    UserName: "",
    email: "",
    phone: "",
    address: ""
  });
  const [showRefModal, setShowRefModal] = useState(false);
  const [generatingRef, setGeneratingRef] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartOrders, setCartOrders] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [promocodes, setPromocodes] = useState([]);
  const [showPromocodeBanner, setShowPromocodeBanner] = useState(true);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ratingModalOrder, setRatingModalOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  // Function to fetch promocodes
  const fetchPromocodes = async () => {
    try {
      const promoResponse = await axios({
        method: 'get',
        url: `${API_BASE_URL}/api/dashboard/get-promocodes`,
        headers: { token: getToken() }
      });
      const fetchedPromocodes = promoResponse.data.promocodes || [];
      setPromocodes(fetchedPromocodes);
      
      // Show banner based on available promocodes count
      const availableCount = promoResponse.data.availableCount || 0;
      setShowPromocodeBanner(availableCount > 0);
        
      // Show welcome notification if all 3 promocodes are unused (new user with referral)
      const unusedCount = fetchedPromocodes.filter(p => !p.used).length;
      if (unusedCount === 3 && fetchedPromocodes.length === 3) {
        const notificationKey = `promo_notification_shown_${currentUser.id}`;
        const hasShownBefore = localStorage.getItem(notificationKey);
        
        if (!hasShownBefore) {
          toast.success(
            "🎉 Welcome! Your exclusive discount codes have been emailed to you! Check the banner above. 💌",
            { duration: 6000 }
          );
          localStorage.setItem(notificationKey, 'true');
        }
      }
    } catch (promoError) {
      // User might not have promocodes, that's ok
      console.log("No promocodes found");
    }
  };

  // Auto-hide banner when all promocodes are used
  useEffect(() => {
    if (promocodes.length > 0 && promocodes.filter(p => !p.used).length === 0) {
      setShowPromocodeBanner(false);
    }
  }, [promocodes]);

  // Fetch user data on mount
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: `${API_BASE_URL}/api/dashboard/get-user`,
          headers: { token: getToken() }
        });
        setUser(response.data.user);
        
        // Fetch promocodes
        await fetchPromocodes();
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || "Failed to load user details";
        toast.error(errorMsg);
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [currentUser, navigate]);

  const handleToggleEditProfile = () => {
    if (!editingProfile) {
      // Populate form with current user data when opening edit mode
      setEditForm({
        fullName: user.fullName || "",
        UserName: user.UserName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
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
        url: `${API_BASE_URL}/api/dashboard/update-user`,
        data: editForm,
        headers: { token: getToken() }
      });
      setUser(res.data.user);
      setEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
      console.error(err);
    }
  };

  const handleGenerateRefId = async () => {
    setGeneratingRef(true);
    try {
      const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/api/dashboard/generate-refid`,
        data: {},
        headers: { token: getToken() }
      });
      setUser(res.data.user);
      toast.success("Reference ID generated successfully");
      setShowRefModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate reference ID");
      console.error(err);
    } finally {
      setGeneratingRef(false);
    }
  };

  const handleOpenCart = async () => {
    setCartLoading(true);
    try {
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/api/dashboard/get-user-cart`,
        headers: { token: getToken() }
      });
      setCartOrders(response.data.cartOrders);
      setShowCartModal(true);
    } catch (error) {
      toast.error("Failed to load cart");
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios({
        method: 'delete',
        url: `${API_BASE_URL}/api/dashboard/cancel-order/${orderId}`,
        headers: { token: getToken() }
      });
      // Remove from local cart
      setCartOrders(cartOrders.filter(order => order._id !== orderId));
      toast.success("Order cancelled");
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error(error);
    }
  };

  const handleConfirmAllOrders = async () => {
    try {
      await axios({
        method: 'put',
        url: `${API_BASE_URL}/api/dashboard/confirm-user-orders`,
        data: {},
        headers: { token: getToken() }
      });
      toast.success("All orders confirmed!");
      setShowCartModal(false);
      setCartOrders([]);
    } catch (error) {
      toast.error("Failed to confirm orders");
      console.error(error);
    }
  };

  const handleOpenOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await axios({
        method: 'get',
        url: `${API_BASE_URL}/api/dashboard/get-user-orders`,
        headers: { token: getToken() }
      });
      setOrders(response.data.orders);
      setShowOrdersModal(true);
    } catch (error) {
      toast.error("Failed to load orders");
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleOpenRatingModal = (order) => {
    setRatingModalOrder(order);
    setRating(0);
    setReview("");
    setHoveredStar(0);
  };

  const handleRateRestaurant = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      await axios({
        method: 'post',
        url: `${API_BASE_URL}/api/dashboard/rate-restaurant`,
        data: {
          restaurantId: ratingModalOrder.restaurantId,
          orderId: ratingModalOrder._id,
          rating,
          review: review.trim() || null
        },
        headers: { token: getToken() }
      });

      toast.success("Thank you for your rating!");
      
      // Update order in local state
      setOrders(orders.map(o => 
        o._id === ratingModalOrder._id 
          ? { ...o, userRating: rating, userReview: review, ratedAt: new Date() }
          : o
      ));
      
      setRatingModalOrder(null);
      setRating(0);
      setReview("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
      console.error(error);
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

  if (!user) {
    return (
      <div className="card w-full max-w-6xl bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h2 className="text-2xl font-bold text-center mb-4">User Dashboard</h2>
          <p className="text-center text-error">
            Failed to load user data. Please try logging in again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-6xl bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">User Dashboard</h2>
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setShowRefModal(true)}
            >
              Reference
            </button>
            <button
              className="btn btn-sm btn-outline"
              onClick={handleToggleEditProfile}
            >
              {editingProfile ? "Close" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Promocode Banner */}
        {showPromocodeBanner && (() => {
          const unusedPromocodes = promocodes.filter(p => !p.used);
          const unusedCount = unusedPromocodes.length;
          
          if (unusedCount === 0) return null;
          
          return (
          <div className="alert alert-info mb-4 relative pr-12">
            <button
              className="btn btn-ghost btn-sm absolute top-2 right-2 z-10"
              onClick={() => setShowPromocodeBanner(false)}
              type="button"
            >
              <X size={18} />
            </button>
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold">
                  {unusedCount === 3 ? '🎉 Welcome to UTHAO!' : 
                   unusedCount === 2 ? '✨ Great Choice!' : 
                   '🎊 Last Chance!'}
                </h3>
                <div className="text-sm">
                  {unusedCount === 3 ? (
                    <>
                      You have <strong>{unusedCount} exclusive welcome promocodes</strong> waiting for you! 
                      Thank you for joining us through a referral! 🌟
                    </>
                  ) : unusedCount === 2 ? (
                    <>
                      You still have <strong>{unusedCount} amazing promocodes</strong> left! 
                      Continue saving up to <strong>{Math.max(...unusedPromocodes.map(p => p.discount))}%</strong> on your next orders. 
                      Keep enjoying the benefits! 💫
                    </>
                  ) : (
                    <>
                      You have <strong>1 more special promocode</strong> remaining! 
                      Don't miss out on your <strong>{unusedPromocodes[0]?.discount}%</strong> discount. 
                      Make it count! 🎁
                    </>
                  )}
                  <div className="mt-1 text-xs opacity-80">
                    📧 Your promocodes have been sent to your email. Check your inbox!
                  </div>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Edit Profile Form */}
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
              <div>
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
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        )}

        {/* User Profile Display */}
        <div className="bg-base-200 p-6 rounded-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-24">
                <span className="text-3xl">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-6">
            {user.fullName || user.UserName}
          </h3>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <div className="font-semibold w-24">Username:</div>
              <div className="flex-1">{user.UserName}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-24">Email:</div>
              <div className="flex-1">{user.email}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-24">Phone:</div>
              <div className="flex-1">{user.phone}</div>
            </div>
            <div className="flex items-start">
              <div className="font-semibold w-24">Address:</div>
              <div className="flex-1">{user.address || "Not provided"}</div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="btn btn-primary" onClick={() => handleOpenCart()}>See Cart</button>
            <button className="btn btn-outline" onClick={() => handleOpenOrders()}>View Order History</button>
          </div>
        </div>
      </div>

      {/* Reference Modal */}
      {showRefModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Reference ID</h3>

            {user.refId ? (
              <div>
                <p className="mb-4">Your permanent reference ID:</p>
                <div className="bg-base-200 p-4 rounded-lg text-center">
                  <code className="text-xl font-bold text-primary">{user.refId}</code>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">You don't have a reference ID yet.</p>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleGenerateRefId}
                  disabled={generatingRef}
                >
                  {generatingRef ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Generating...
                    </>
                  ) : (
                    "Generate Reference ID"
                  )}
                </button>
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowRefModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCartModal && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Your Cart</h3>

            {cartOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cartOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between bg-base-200 p-4 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{order.menuItemName}</h4>
                        <p className="text-sm text-gray-600">{order.restaurantName}</p>
                        <p className="text-sm">{order.deliveryAddress}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">${order.price}</span>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn btn-sm btn-circle btn-error"
                          title="Cancel Order"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider"></div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${cartOrders.reduce((total, order) => total + order.price, 0).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <div className="modal-action">
              <button
                onClick={() => setShowCartModal(false)}
                className="btn btn-ghost"
              >
                Close
              </button>
              {cartOrders.length > 0 && (
                <button
                  onClick={handleConfirmAllOrders}
                  className="btn btn-primary"
                >
                  Confirm All Orders
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrdersModal && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-4xl max-h-[90vh]">
            <h3 className="font-bold text-lg mb-4">Order History</h3>

            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[70vh]">
                {orders.map((order) => (
                  <div key={order._id} className="bg-base-200 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{order.restaurantName}</h4>
                        <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                        <p className="text-sm">
                          <span className="font-semibold">Status:</span>{" "}
                          <span className={`badge ${
                            order.status === 'delivered' ? 'badge-success' :
                            order.status === 'cancelled' ? 'badge-error' :
                            'badge-warning'
                          }`}>
                            {order.status}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary text-xl">${order.price}</span>
                      </div>
                    </div>

                    {/* Rating Section */}
                    {order.status === 'delivered' && (
                      <div className="mt-3 pt-3 border-t border-base-300">
                        {order.userRating ? (
                          <div className="bg-base-100 p-3 rounded">
                            <p className="text-sm font-semibold mb-1">Your Rating:</p>
                            <div className="flex items-center gap-2 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= order.userRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-400"
                                  }`}
                                />
                              ))}
                              <span className="text-sm text-gray-600">
                                ({new Date(order.ratedAt).toLocaleDateString()})
                              </span>
                            </div>
                            {order.userReview && (
                              <p className="text-sm italic text-gray-600">"{order.userReview}"</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenRatingModal(order)}
                            className="btn btn-sm btn-outline btn-primary"
                          >
                            Rate Restaurant
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button
                onClick={() => setShowOrdersModal(false)}
                className="btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOrder && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Rate {ratingModalOrder.restaurantName}</h3>

            <div className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Your Rating</span>
                </label>
                <div className="flex gap-2 justify-center py-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-10 h-10 cursor-pointer transition-all ${
                        star <= (hoveredStar || rating)
                          ? "fill-yellow-400 text-yellow-400 scale-110"
                          : "text-gray-400"
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                    />
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600">
                    You rated: {rating} star{rating > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">Review (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Share your experience..."
                  rows="4"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setRatingModalOrder(null)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleRateRestaurant}
                className="btn btn-primary"
                disabled={rating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardWindow;
