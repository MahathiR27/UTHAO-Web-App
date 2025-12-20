import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart, Calendar } from "lucide-react";
import { getUser, getToken } from "../utils/authUtils";

const MenuBrowserWindow = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const restaurantId = params.get("id");
  const currentUser = getUser();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    name: "",
    address: "",
    date: "",
    numberOfPeople: ""
  });
  const [orderForm, setOrderForm] = useState({
    deliveryAddress: ""
  });

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
    setSelectedMenuItem(menuItem);
    setShowOrderModal(true);
  };

  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMakeReservation = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("User authentication required");
      return;
    }

    // Basic validation
    if (!reservationForm.name || !reservationForm.address || !reservationForm.date || !reservationForm.numberOfPeople) {
      toast.error("Please fill in all fields");
      return;
    }

    const peopleCount = parseInt(reservationForm.numberOfPeople);
    if (peopleCount <= 0) {
      toast.error("Number of people must be greater than 0");
      return;
    }

    try {
      const response = await axios({
        method: 'post',
        url: `http://localhost:5001/api/dashboard/make-reservation/${restaurantId}`,
        data: reservationForm,
        headers: { token: getToken() }
      });

      toast.success("Reservation request submitted successfully!");
      setShowReservationModal(false);
      setReservationForm({
        name: "",
        address: "",
        date: "",
        numberOfPeople: ""
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to make reservation");
      console.error(error);
    }
  };

  const openReservationModal = () => {
    if (!currentUser) {
      toast.error("User authentication required. Please log in again.");
      return;
    }
    setShowReservationModal(true);
  };

  const closeReservationModal = () => {
    setShowReservationModal(false);
    setReservationForm({
      name: "",
      address: "",
      date: "",
      numberOfPeople: ""
    });
  };

  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMakeOrder = async (e) => {
    e.preventDefault();

    if (!orderForm.deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (!currentUser) {
      toast.error("Please log in first");
      return;
    }

    try {
      const orderData = {
        restaurantId: restaurantId,
        menuItemId: selectedMenuItem._id || selectedMenuItem.id,
        price: selectedMenuItem.price || 0,
        deliveryAddress: orderForm.deliveryAddress
      };

      const response = await axios({
        method: 'post',
        url: `http://localhost:5001/api/dashboard/make-order`,
        data: orderData,
        headers: { token: getToken() }
      });

      toast.success("Order placed successfully!");
      setShowOrderModal(false);
      setOrderForm({ deliveryAddress: "" });
      setSelectedMenuItem(null);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderForm({ deliveryAddress: "" });
    setSelectedMenuItem(null);
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

      {/* Reservation Card */}
      {restaurant && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-xl">Make a Reservation</h3>
              <div className="mb-4">
                {restaurant.reservationLimit === 0 ? (
                  <p className="text-red-600 font-semibold">Cannot reserve - No reservation limit set</p>
                ) : (() => {
                  const usedSeats = restaurant.reservations?.filter(r => r.status === 'pending' || r.status === 'confirmed')
                    .reduce((total, r) => total + r.numberOfPeople, 0) || 0;
                  const remainingSeats = restaurant.reservationLimit - usedSeats;
                  return remainingSeats <= 0 ? (
                    <p className="text-red-600 font-semibold">Cannot reserve - All seats are booked</p>
                  ) : (
                    <p className="text-green-600 font-semibold">
                      {remainingSeats} seats remaining out of {restaurant.reservationLimit}
                    </p>
                  );
                })()}
              </div>
              <div className="card-actions justify-end">
                <button
                  onClick={openReservationModal}
                  className={`btn gap-2 ${
                    restaurant.reservationLimit === 0 ||
                    (restaurant.reservations?.filter(r => r.status === 'pending' || r.status === 'confirmed')
                      .reduce((total, r) => total + r.numberOfPeople, 0) || 0) >= restaurant.reservationLimit
                      ? 'btn-disabled'
                      : 'btn-secondary'
                  }`}
                  disabled={
                    restaurant.reservationLimit === 0 ||
                    (restaurant.reservations?.filter(r => r.status === 'pending' || r.status === 'confirmed')
                      .reduce((total, r) => total + r.numberOfPeople, 0) || 0) >= restaurant.reservationLimit
                  }
                >
                  <Calendar size={16} />
                  Make Reservation
                </button>
              </div>
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

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal modal-open">
            <div className="modal-box w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Make a Reservation</h3>
              <form onSubmit={handleMakeReservation}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={reservationForm.name}
                    onChange={handleReservationChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Address</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={reservationForm.address}
                    onChange={handleReservationChange}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Date</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={reservationForm.date}
                    onChange={handleReservationChange}
                    className="input input-bordered"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Number of People</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfPeople"
                    value={reservationForm.numberOfPeople}
                    onChange={handleReservationChange}
                    className="input input-bordered"
                    min="1"
                    required
                  />
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    onClick={closeReservationModal}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedMenuItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal modal-open">
            <div className="modal-box w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Place Order</h3>

              <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <h4 className="font-semibold">{selectedMenuItem.name}</h4>
                <p className="text-sm text-gray-600">{selectedMenuItem.description}</p>
                <p className="text-lg font-bold text-primary mt-2">
                  ${selectedMenuItem.price || "N/A"}
                </p>
              </div>

              <form onSubmit={handleMakeOrder}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Delivery Address</span>
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={orderForm.deliveryAddress}
                    onChange={handleOrderChange}
                    placeholder="Enter your full delivery address"
                    className="textarea textarea-bordered h-20"
                    required
                  />
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    onClick={closeOrderModal}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Place Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBrowserWindow;
