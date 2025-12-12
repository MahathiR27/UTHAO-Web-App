import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { X, ShoppingCart } from "lucide-react";

const MenuBrowserWindow = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState(null);
  const [restaurantMenuItems, setRestaurantMenuItems] = useState([]);

  // Fetch all menu items on mount
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/dashboard/get-all-menu-items"
        );
        setMenuItems(response.data.items || []);
      } catch (error) {
        toast.error("Failed to load menu items");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleViewRestaurant = async (restaurantId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/dashboard/get-restaurant/${restaurantId}`
      );
      setRestaurantDetails(response.data.restaurant);
      setRestaurantMenuItems(response.data.restaurant.menu || []);
      setSelectedRestaurant(restaurantId);
      setShowRestaurantModal(true);
    } catch (error) {
      toast.error("Failed to load restaurant details");
      console.error(error);
    }
  };

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

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center">Restaurant Menu Browser</h1>

      {menuItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No menu items available</p>
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
                  {item.restaurantId && (
                    <button
                      onClick={() => handleViewRestaurant(item.restaurantId)}
                      className="btn btn-sm btn-outline"
                    >
                      View Restaurant
                    </button>
                  )}
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

      {/* Restaurant Details Modal */}
      {showRestaurantModal && restaurantDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal modal-open">
            <div className="modal-box w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="sticky top-0 bg-base-100 pb-4 flex justify-between items-center border-b">
                <h2 className="text-2xl font-bold">{restaurantDetails.RestaurantName}</h2>
                <button
                  onClick={closeModal}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-4">
                {/* Restaurant Info */}
                <div className="mb-6 pb-4 border-b">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Owner:</span> {restaurantDetails.OwnerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Email:</span> {restaurantDetails.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Restaurant Phone:</span>{" "}
                      {restaurantDetails.RestaurantPhone}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Owner Phone:</span>{" "}
                      {restaurantDetails.OwnerPhone}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Address:</span> {restaurantDetails.address}
                    </p>
                    {restaurantDetails.description && (
                      <p className="text-sm">
                        <span className="font-semibold">Description:</span>{" "}
                        {restaurantDetails.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Restaurant Menu Items */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Menu Items</h3>
                  {restaurantMenuItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No menu items available for this restaurant
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {restaurantMenuItems.map((item, index) => (
                        <div
                          key={index}
                          className="card bg-base-200 shadow-sm"
                        >
                          <div className="card-body p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg">{item.name}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-lg font-bold text-primary ml-4">
                                ${item.price || "N/A"}
                              </span>
                            </div>
                            <div className="mt-3 flex justify-end">
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
              </div>

              {/* Modal Footer */}
              <div className="border-t pt-4 flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBrowserWindow;
