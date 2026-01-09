import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { X, Heart } from "lucide-react";
import { getUser, getToken } from "../utils/authUtils";

const UserDashboardWindow = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUser = getUser();

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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [ongoingRides, setOngoingRides] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState('completed');
  const [showFirstLoginBanner, setShowFirstLoginBanner] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: "" });
  const [reviewedOrders, setReviewedOrders] = useState(new Set());
  const [showFavouritesModal, setShowFavouritesModal] = useState(false);
  const [favouriteRestaurants, setFavouriteRestaurants] = useState([]);
  const [favouritesLoading, setFavouritesLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    // Check if this is first login AND user was referred (show banner only once for referred users)
    if (currentUser.firstLoginCompleted === false && currentUser.referredBy) {
      setShowFirstLoginBanner(true);
    }

    let isMounted = true;

    const fetchUser = async () => {
      try {
        const response = await axios({
          method: 'get',
          url: "http://localhost:5001/api/dashboard/get-user",
          headers: { token: getToken() }
        });
        if (isMounted) {
          setUser(response.data.user);
        }
      } catch (error) {
        if (isMounted) {
          const errorMsg = error.response?.data?.message || error.message || "Failed to load user details";
          toast.error(errorMsg);
          console.error("Dashboard Error:", error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Check if cart should be opened from URL parameter
  useEffect(() => {
    const openCart = searchParams.get('openCart');
    if (openCart === 'true' && user) {
      handleOpenCart();
      // Clear the parameter after opening
      navigate('/user-dashboard', { replace: true });
    }
  }, [searchParams, user]);

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
        url: "http://localhost:5001/api/dashboard/update-user",
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
        url: "http://localhost:5001/api/dashboard/generate-refid",
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
        url: "http://localhost:5001/api/dashboard/get-user-cart",
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
        url: `http://localhost:5001/api/dashboard/cancel-order/${orderId}`,
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
        url: "http://localhost:5001/api/dashboard/confirm-user-orders",
        data: { promoCode: promoCode.trim() },
        headers: { token: getToken() }
      });
      toast.success("All orders confirmed!");
      setShowCartModal(false);
      setCartOrders([]);
      setPromoCode("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm orders");
      console.error(error);
    }
  };

  const handleOpenHistory = async () => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    try {
      // Fetch order history
      const historyResponse = await axios({
        method: 'get',
        url: "http://localhost:5001/api/dashboard/get-order-history",
        headers: { token: getToken() }
      });
      setOrderHistory(historyResponse.data.history || []);

      // Check which orders have been reviewed
      const reviewed = new Set();
      for (const item of historyResponse.data.history || []) {
        if (item.type === 'food') {
          try {
            const reviewCheckResponse = await axios.get(
              `http://localhost:5001/api/dashboard/check-order-review/${item._id}`
            );
            if (reviewCheckResponse.data.hasReview) {
              reviewed.add(item._id);
            }
          } catch (error) {
            console.error(`Failed to check review for order ${item._id}`);
          }
        }
      }
      setReviewedOrders(reviewed);

      // Fetch ongoing activity
      const ongoingResponse = await axios({
        method: 'get',
        url: "http://localhost:5001/api/dashboard/get-ongoing-activity",
        headers: { token: getToken() }
      });
      setOngoingOrders(ongoingResponse.data.ongoingOrders || []);
      setOngoingRides(ongoingResponse.data.ongoingRides || []);
    } catch (error) {
      toast.error("Failed to load order history");
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeRemaining = (orderedAt) => {
    const orderTime = new Date(orderedAt);
    const deliveryTime = new Date(orderTime.getTime() + 30 * 60000); // 30 minutes
    const now = new Date();
    const remaining = Math.max(0, Math.ceil((deliveryTime - now) / 60000));
    return remaining;
  };

  const handleOpenReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewForm({ rating: 5, reviewText: "" });
    setShowReviewModal(true);
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!reviewForm.reviewText.trim()) {
      toast.error("Please enter a review");
      return;
    }

    try {
      await axios({
        method: 'post',
        url: "http://localhost:5001/api/dashboard/submit-review",
        data: {
          orderId: selectedOrder._id,
          restaurantId: selectedOrder.restaurantId,
          rating: reviewForm.rating,
          reviewText: reviewForm.reviewText
        },
        headers: { token: getToken() }
      });

      toast.success("Review submitted successfully!");
      setShowReviewModal(false);
      setSelectedOrder(null);
      setReviewForm({ rating: 5, reviewText: "" });

      // Mark this order as reviewed
      setReviewedOrders(prev => new Set([...prev, selectedOrder._id]));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
      console.error(error);
    }
  };

  const handleOpenFavourites = async () => {
    setShowFavouritesModal(true);
    setFavouritesLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:5001/api/dashboard/get-favourites',
        { headers: { token: getToken() } }
      );
      setFavouriteRestaurants(response.data.favourites || []);
    } catch (error) {
      toast.error("Failed to load favourites");
      console.error(error);
    } finally {
      setFavouritesLoading(false);
    }
  };

  const handleRemoveFavourite = async (restaurantId) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/dashboard/remove-favourite/${restaurantId}`,
        { headers: { token: getToken() } }
      );
      toast.success("Removed from favourites");
      setFavouriteRestaurants(prev => prev.filter(r => r._id !== restaurantId));
    } catch (error) {
      toast.error("Failed to remove from favourites");
      console.error(error);
    }
  };

  const handleViewRestaurant = (restaurantId) => {
    navigate(`/menu-browser?id=${restaurantId}`);
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
        {/* First Login Banner */}
        {showFirstLoginBanner && (
          <div className="alert alert-success shadow-lg mb-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-semibold">🎉 You have 3 exclusive promo codes emailed to you!</span>
              </div>
              <button 
                onClick={() => setShowFirstLoginBanner(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

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

          <div className="flex justify-center gap-2">
            <button className="btn btn-outline" onClick={handleOpenHistory}>View Order History</button>
            <button className="btn btn-outline" onClick={handleOpenFavourites}>
              <Heart className="w-4 h-4" />
              Favourites
            </button>
          </div>
        </div>
      </div>

      {/* Order History Modal */}
      {showHistoryModal && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-4xl max-h-[90vh]">
            <h3 className="font-bold text-lg mb-4">Order & Ride History</h3>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-4">
              <button 
                className={`tab ${historyTab === 'completed' ? 'tab-active' : ''}`}
                onClick={() => setHistoryTab('completed')}
              >
                Completed Orders
              </button>
              <button 
                className={`tab ${historyTab === 'ongoing' ? 'tab-active' : ''}`}
                onClick={() => setHistoryTab('ongoing')}
              >
                Ongoing Activity
              </button>
            </div>

            {historyLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <>
                {/* Completed Orders Tab */}
                {historyTab === 'completed' && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orderHistory.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No order history yet</p>
                    ) : (
                      orderHistory.map((item) => (
                        <div key={item._id} className="bg-base-200 p-4 rounded-lg">
                          {item.type === 'food' ? (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="badge badge-primary badge-sm mb-2">Food Order</div>
                                  <h4 className="font-semibold text-lg">{item.menuItemName}</h4>
                                  <p className="text-sm text-gray-600">{item.restaurantName}</p>
                                  <p className="text-xs text-gray-500 mt-1">📍 {item.deliveryAddress}</p>
                                </div>
                                <div className="text-right">
                                  {item.originalPrice && item.promoCode ? (
                                    <div>
                                      <p className="text-xs text-gray-500 line-through">${item.originalPrice.toFixed(2)}</p>
                                      <p className="font-bold text-success text-lg">${item.totalAmount.toFixed(2)}</p>
                                      <p className="text-xs text-success">🎉 -{item.discountPercentage}% off</p>
                                    </div>
                                  ) : (
                                    <p className="font-bold text-primary text-lg">${item.totalAmount.toFixed(2)}</p>
                                  )}
                                  <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
                              </div>
                              <div className="mt-3">
                                {reviewedOrders.has(item._id) ? (
                                  <button
                                    disabled
                                    className="btn btn-sm btn-disabled"
                                  >
                                    Reviewed ✓
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenReviewModal({
                                      _id: item._id,
                                      restaurantId: item.restaurantId,
                                      restaurantName: item.restaurantName
                                    })}
                                    className="btn btn-sm btn-outline btn-primary"
                                  >
                                    Add Review
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="badge badge-secondary badge-sm mb-2">Ride</div>
                                  <h4 className="font-semibold">From: {item.fromAddress}</h4>
                                  <h4 className="font-semibold">To: {item.destination}</h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Distance: {item.distance?.toFixed(2)} km • Duration: {Math.ceil(item.duration)} mins
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary text-lg">${item.totalCost.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Ongoing Activity Tab */}
                {historyTab === 'ongoing' && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {/* Ongoing Food Orders */}
                    {ongoingOrders.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-gray-600">Food Orders</h4>
                        <div className="space-y-3">
                          {ongoingOrders.map((order) => (
                            <div key={order._id} className="bg-base-200 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="badge badge-warning badge-sm mb-2">
                                    {order.status.toUpperCase()}
                                  </div>
                                  <h4 className="font-semibold text-lg">{order.menuItemName}</h4>
                                  <p className="text-sm text-gray-600">{order.restaurantName}</p>
                                  <p className="text-xs text-gray-500 mt-1">📍 {order.deliveryAddress}</p>
                                </div>
                                <div className="text-right">
                                  {order.originalPrice && order.promoCode ? (
                                    <div>
                                      <p className="text-xs text-gray-500 line-through">${order.originalPrice.toFixed(2)}</p>
                                      <p className="font-bold text-success text-lg">${order.totalAmount.toFixed(2)}</p>
                                      <p className="text-xs text-success">🎉 -{order.discountPercentage}% off</p>
                                    </div>
                                  ) : (
                                    <p className="font-bold text-primary text-lg">${order.totalAmount.toFixed(2)}</p>
                                  )}
                                </div>
                              </div>
                              <div className="divider my-2"></div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Estimated Delivery:</span>
                                <span className="font-semibold text-warning">
                                  ~{calculateTimeRemaining(order.orderedAt)} mins
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ongoing Rides */}
                    {ongoingRides.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm text-gray-600">Rides</h4>
                        <div className="space-y-3">
                          {ongoingRides.map((ride) => (
                            <div key={ride._id} className="bg-base-200 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <div className="badge badge-info badge-sm mb-2">
                                    {ride.status.toUpperCase()}
                                  </div>
                                  <h4 className="font-semibold">From: {ride.fromAddress}</h4>
                                  <h4 className="font-semibold">To: {ride.destination}</h4>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary text-lg">${ride.totalCost.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="divider my-2"></div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Estimated Time:</span>
                                <span className="font-semibold text-info">
                                  ~{Math.ceil(ride.estimatedTime)} mins
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {ongoingOrders.length === 0 && ongoingRides.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No ongoing orders or rides</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowHistoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                        {order.originalPrice && order.promoCode && (
                          <p className="text-xs text-success mt-1">🎉 Promo applied: -{order.discountPercentage}% off</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {order.originalPrice && order.promoCode ? (
                            <>
                              <p className="text-xs text-gray-500 line-through">${order.originalPrice.toFixed(2)}</p>
                              <span className="font-bold text-success">${order.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="font-bold text-primary">${order.price.toFixed(2)}</span>
                          )}
                        </div>
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

                {/* Promo Code Input */}
                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Promo Code (Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="input input-bordered w-full focus:outline-none"
                  />
                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Have a promo code? Enter it to get a discount!
                    </span>
                  </label>
                </div>

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
                onClick={() => {
                  setShowCartModal(false);
                  setPromoCode("");
                }}
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

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Review {selectedOrder.restaurantName}</h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Rating</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="text-3xl"
                    >
                      {star <= reviewForm.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Review</span>
                </label>
                <textarea
                  name="reviewText"
                  value={reviewForm.reviewText}
                  onChange={handleReviewFormChange}
                  placeholder="Share your experience with this restaurant..."
                  className="textarea textarea-bordered w-full h-32 focus:outline-none"
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedOrder(null);
                    setReviewForm({ rating: 5, reviewText: "" });
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Favourites Modal */}
      {showFavouritesModal && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-4xl max-h-[90vh]">
            <h3 className="font-bold text-lg mb-4">My Favourite Restaurants</h3>

            {favouritesLoading ? (
              <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : favouriteRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">No favourite restaurants yet</p>
                <p className="text-sm text-gray-400 mt-2">Add your favourites to get faster access to your preferred restaurants!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[60vh]">
                {favouriteRestaurants.map((restaurant) => (
                  <div key={restaurant._id} className="card bg-base-200 shadow-lg">
                    <div className="card-body p-4">
                      <h3 className="card-title text-lg">{restaurant.RestaurantName}</h3>
                      <p className="text-sm text-gray-600">{restaurant.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="badge badge-primary badge-sm">
                          {restaurant.cuisine || "General"}
                        </span>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button
                          onClick={() => handleRemoveFavourite(restaurant._id)}
                          className="btn btn-sm btn-error btn-outline"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          Remove
                        </button>
                        <button
                          onClick={() => handleViewRestaurant(restaurant._id)}
                          className="btn btn-sm btn-primary"
                        >
                          View Menu
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={() => setShowFavouritesModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardWindow;
