import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { getUser, getToken } from "../utils/authUtils";

const UserDashboardWindow = () => {
  const navigate = useNavigate();
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
          url: "http://localhost:5001/api/dashboard/get-user",
          headers: { token: getToken() }
        });
        setUser(response.data.user);
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
            <button className="btn btn-outline" onClick={handleOpenHistory}>View Order History</button>
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
                                  <p className="font-bold text-primary text-lg">${item.totalAmount}</p>
                                  <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                </div>
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
                                  <p className="font-bold text-primary text-lg">${item.totalCost}</p>
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
                                  <p className="font-bold text-primary text-lg">${order.totalAmount}</p>
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
                                  <p className="font-bold text-primary text-lg">${ride.totalCost}</p>
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
    </div>
  );
};

export default UserDashboardWindow;
