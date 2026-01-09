import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { User, LogOut, Car, UtensilsCrossed, ClipboardList, Truck, ShoppingCart, Bell, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { getUser, removeToken, getToken } from "../utils/authUtils";

const Navbar = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      const notificationInterval = setInterval(() => {
        fetchNotifications();
      }, 30000);

      return () => clearInterval(notificationInterval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    try {
      const [notificationsRes, unreadCountRes] = await Promise.all([
        axios.get('http://localhost:5001/api/dashboard/notifications', {
          headers: { token: getToken() }
        }),
        axios.get('http://localhost:5001/api/dashboard/notifications/unread-count', {
          headers: { token: getToken() }
        })
      ]);
      setNotifications(notificationsRes.data.notifications || []);
      setUnreadCount(unreadCountRes.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotificationsModal(true);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5001/api/dashboard/notifications/${notificationId}/read`,
        {},
        { headers: { token: getToken() } }
      );
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(
        'http://localhost:5001/api/dashboard/notifications/mark-all-read',
        {},
        { headers: { token: getToken() } }
      );
      fetchNotifications();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleLogout = () => {
    removeToken();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const getDashboardPath = () => {
    if (!currentUser) return "/login";
    if (currentUser.userType === "restaurant") return "/restaurant-dashboard";
    if (currentUser.userType === "driver") return "/driver-dashboard";
    return "/user-dashboard";
  };

  return (
    <>
    <nav className="navbar bg-base-100 shadow-lg px-4 md:px-8 sticky top-0 z-50">
      {/* Left - Logo */}
      <div className="flex-1">
        <button
          onClick={() => navigate(getDashboardPath())}
          className="btn btn-ghost text-2xl font-bold text-primary"
        >
          UTHAO
        </button>
      </div>

      {/* Center - Navigation Buttons for Users */}
      {currentUser?.userType === "user" && (
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/ride-request")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Car size={18} />
            Request Ride
          </button>
          <button
            onClick={() => navigate("/browse-restaurants")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <UtensilsCrossed size={18} />
            Restaurants
          </button>
          <button
            onClick={() => navigate("/user-dashboard?openCart=true")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ShoppingCart size={18} />
            Cart
          </button>
        </div>
      )}

      {/* Center - Navigation Buttons for Drivers */}
      {currentUser?.userType === "driver" && (
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/driver-ride-requests")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ClipboardList size={18} />
            Ride Requests
          </button>
          <button
            onClick={() => navigate("/driver-delivery-requests")}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Truck size={18} />
            Delivery Requests
          </button>
        </div>
      )}

      {/* Right - Notification Bell and Profile Dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification Bell - Only show for logged in users and drivers */}
        {currentUser && (currentUser.userType === "user" || currentUser.userType === "driver") && (
          <div className="indicator">
            {unreadCount > 0 && (
              <span className="indicator-item badge badge-error badge-sm">
                {unreadCount}
              </span>
            )}
            <button 
              className="btn btn-ghost btn-circle hover:bg-primary/10" 
              onClick={handleOpenNotifications}
            >
              <Bell size={22} />
            </button>
          </div>
        )}

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
        <button
          tabIndex={0}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="btn btn-ghost btn-circle"
        >
          <User size={24} />
        </button>
        
        {dropdownOpen && (
          <ul
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow-lg border border-base-300 mt-2"
          >
            <li>
              <button onClick={() => { navigate(getDashboardPath()); setDropdownOpen(false); }}>
                <User size={18} />
                Dashboard
              </button>
            </li>
            <li>
              <button onClick={handleLogout} className="text-error">
                <LogOut size={18} />
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
      </div>
    </nav>

    {/* Notifications Modal */}
    {showNotificationsModal && (
      <div className="modal modal-open" style={{ zIndex: 9999 }}>
        <div className="modal-box max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={handleMarkAllAsRead}
                >
                  Mark All Read
                </button>
              )}
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowNotificationsModal(false)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-base-content/50">
                <Bell className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead 
                      ? 'bg-base-200 border-base-300' 
                      : 'bg-primary/10 border-primary/30'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-xs text-base-content/60 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="modal-backdrop" onClick={() => setShowNotificationsModal(false)}></div>
      </div>
    )}
    </>
  );
};

export default Navbar;
