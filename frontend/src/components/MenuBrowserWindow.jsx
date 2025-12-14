import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

const MenuBrowserWindow = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const restaurantId = params.get("id");

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurant menu items on mount
  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchRestaurantMenu = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/dashboard/get-restaurant-menu/${restaurantId}`
        );
        setRestaurant(response.data.restaurant);
        setMenuItems(response.data.menuItems || []);
      } catch (error) {
        toast.error("Failed to load restaurant menu");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantMenu();
  }, [restaurantId]);

  const handleOrder = (menuItem) => {
    toast.success(`Added "${menuItem.name}" to cart (placeholder)`);
    // TODO: Implement actual order functionality
  };

  const closeModal = () => {
    setShowRestaurantModal(false);
    setSelectedRestaurant(null);
    setRestaurantDetails(null);
    setRestaurantMenuItems([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Restaurant Selected</h2>
          <p className="text-gray-600">Please select a restaurant to view its menu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      {/* Restaurant Header */}
      {restaurant && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h1 className="text-3xl font-bold">{restaurant.RestaurantName}</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <div>
                  <span className="font-semibold">Owner:</span> {restaurant.OwnerName}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span> {restaurant.RestaurantPhone}
                </div>
                <div>
                  <span className="font-semibold">Address:</span> {restaurant.address}
                </div>
              </div>
              {restaurant.description && (
                <p className="mt-4 text-gray-600">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <h2 className="text-2xl font-bold mb-6 text-center">Menu</h2>

      {menuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No menu items available for this restaurant</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {menuItems.map((item) => (
            <div key={item._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              {item.image && (
                <figure className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </figure>
              )}
              <div className="card-body">
                <h2 className="card-title text-lg">{item.name}</h2>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-primary">
                    ${item.price || "N/A"}
                  </span>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleOrder(item)}
                    className="btn btn-primary btn-sm gap-2"
                  >
                    <ShoppingCart size={16} />
                    Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuBrowserWindow;
