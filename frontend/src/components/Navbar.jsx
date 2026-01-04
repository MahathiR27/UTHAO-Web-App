import { useState } from "react";
import { useNavigate } from "react-router";
import { User, LogOut, Car, UtensilsCrossed, ClipboardList, Truck, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { getUser, removeToken } from "../utils/authUtils";

const Navbar = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      {/* Right - Profile Dropdown */}
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
    </nav>
  );
};

export default Navbar;
