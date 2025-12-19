import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const UserDashboardWindow = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get("id");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(null);
  const [showRefModal, setShowRefModal] = useState(false);
  const [generatingRef, setGeneratingRef] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartOrders, setCartOrders] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/dashboard/get-user/${userId}`
        );
        setUser(response.data.user);
        setProfileForm(response.data.user);
      } catch (error) {
        toast.error("Failed to load user details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handleToggleEditProfile = () => {
    setEditingProfile((s) => !s);
    setProfileForm(user);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((p) => ({ ...p, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:5001/api/dashboard/update-user/${userId}`,
        profileForm
      );
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
      const res = await axios.post(
        `http://localhost:5001/api/dashboard/generate-refid/${userId}`
      );
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
      const response = await axios.get(
        `http://localhost:5001/api/dashboard/get-user-cart/${userId}`
      );
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
      await axios.delete(
        `http://localhost:5001/api/dashboard/cancel-order/${orderId}`
      );
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
      await axios.put(
        `http://localhost:5001/api/dashboard/confirm-user-orders/${userId}`
      );
      toast.success("All orders confirmed!");
      setShowCartModal(false);
      setCartOrders([]);
    } catch (error) {
      toast.error("Failed to confirm orders");
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
            No user ID provided. Use ?id=USER_ID in the URL.
          </p>
          <div className="mt-3 text-sm text-center text-muted">
            <div>Debug: location.search = <code>{location.search}</code></div>
            <div>Debug: parsed id = <code>{userId}</code></div>
          </div>
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
        {editingProfile && profileForm && (
          <form
            onSubmit={handleUpdateProfile}
            className="bg-base-200 p-4 rounded-lg mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">
                  <span className="label-text">User Name</span>
                </label>
                <input
                  name="UserName"
                  value={profileForm.UserName || ""}
                  onChange={handleProfileChange}
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
                  value={profileForm.email || ""}
                  onChange={handleProfileChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  name="phone"
                  value={profileForm.phone || ""}
                  onChange={handleProfileChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <input
                  name="address"
                  value={profileForm.address || ""}
                  onChange={handleProfileChange}
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
                  {user.UserName ? user.UserName.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-6">
            {user.UserName}
          </h3>

          <div className="space-y-3 mb-6">
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

          <div className="flex justify-center gap-4">
            <button className="btn btn-primary" onClick={() => handleOpenCart()}>See Cart</button>
            <button className="btn btn-outline">View Order History</button>
            <button className="btn btn-outline">Browse Restaurants</button>
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
    </div>
  );
};

export default UserDashboardWindow;
