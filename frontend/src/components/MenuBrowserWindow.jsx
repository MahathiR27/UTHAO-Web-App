import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { ShoppingCart, Calendar, Star, Heart } from "lucide-react";
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
  const [restaurantRating, setRestaurantRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    name: "",
    numberOfPeople: "",
    date: ""
  });
  const [orderForm, setOrderForm] = useState({});

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

        // Fetch restaurant rating
        try {
          const ratingResponse = await axios.get(
            `http://localhost:5001/api/dashboard/restaurant-rating/${restaurantId}`
          );
          setRestaurantRating(ratingResponse.data);
        } catch (error) {
          // No ratings yet
          setRestaurantRating({ averageRating: 0, totalReviews: 0 });
        }

        // Fetch restaurant reviews
        try {
          const reviewsResponse = await axios.get(
            `http://localhost:5001/api/dashboard/restaurant-reviews/${restaurantId}`
          );
          setReviews(reviewsResponse.data.reviews || []);
        } catch (error) {
          console.error("Failed to load reviews:", error);
        }

        // Check if restaurant is favourited (only for logged-in users)
        if (currentUser) {
          try {
            const favouritesResponse = await axios.get(
              'http://localhost:5001/api/dashboard/get-favourites',
              { headers: { token: getToken() } }
            );
            const favouriteIds = favouritesResponse.data.favourites.map(fav => fav._id);
            setIsFavourite(favouriteIds.includes(restaurantId));
          } catch (error) {
            console.error("Failed to load favourites:", error);
          }
        }
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

  // Helper function to render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  // Helper function to get applicable offer for a menu item
  const getMenuItemOffer = (menuIndex) => {
    if (!restaurant?.offers) return null;
    
    // Find the first offer that includes this menu item
    return restaurant.offers.find(offer => 
      offer.menuItemIndices && offer.menuItemIndices.includes(menuIndex)
    );
  };

  // Toggle favourite status
  const handleToggleFavourite = async () => {
    if (!currentUser) {
      toast.error("Please log in to add favourites");
      return;
    }

    try {
      if (isFavourite) {
        await axios.delete(
          `http://localhost:5001/api/dashboard/remove-favourite/${restaurantId}`,
          { headers: { token: getToken() } }
        );
        toast.success("Removed from favourites");
        setIsFavourite(false);
      } else {
        await axios.post(
          `http://localhost:5001/api/dashboard/add-favourite/${restaurantId}`,
          {},
          { headers: { token: getToken() } }
        );
        toast.success("Added to favourites");
        setIsFavourite(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update favourites");
      console.error(error);
    }
  };

  // Helper function to calculate discounted price
  const getDiscountedPrice = (originalPrice, percentage) => {
    return originalPrice * (1 - percentage / 100);
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
    if (!reservationForm.name || !reservationForm.numberOfPeople || !reservationForm.date) {
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
        numberOfPeople: "",
        date: ""
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
      numberOfPeople: "",
      date: ""
    });
  };



  const handleMakeOrder = async () => {
    if (!currentUser) {
      toast.error("Please log in first");
      return;
    }

    try {
      const orderData = {
        restaurantId: restaurantId,
        menuItemId: selectedMenuItem._id || selectedMenuItem.id,
        price: selectedMenuItem.price || 0,
        deliveryAddress: currentUser.address
      };

      const response = await axios({
        method: 'post',
        url: `http://localhost:5001/api/dashboard/make-order`,
        data: orderData,
        headers: { token: getToken() }
      });

      toast.success("Order placed successfully!");
      setShowOrderModal(false);
      setOrderForm({});
      setSelectedMenuItem(null);
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    }
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderForm({});
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
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{restaurant.RestaurantName}</h1>
                {currentUser && (
                  <button
                    onClick={handleToggleFavourite}
                    className={`btn btn-circle ${isFavourite ? 'btn-error' : 'btn-ghost'}`}
                  >
                    <Heart 
                      className={`w-6 h-6 ${isFavourite ? 'fill-current' : ''}`}
                    />
                  </button>
                )}
              </div>
              
              {/* Rating Section */}
              {restaurantRating && (
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <div className="flex items-center">
                    {renderStars(restaurantRating.averageRating || 0)}
                  </div>
                  <span className="text-lg font-semibold">
                    {restaurantRating.averageRating 
                      ? restaurantRating.averageRating.toFixed(1) 
                      : '0.0'}
                  </span>
                  {restaurantRating.totalReviews > 0 && (
                    <span className="text-sm text-gray-500">
                      ({restaurantRating.totalReviews} review{restaurantRating.totalReviews !== 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              )}
              
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
                  const usedSeats = restaurant.currentReservations || 0;
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
                    (restaurant.currentReservations || 0) >= restaurant.reservationLimit
                      ? 'btn-disabled'
                      : 'btn-secondary'
                  }`}
                  disabled={
                    restaurant.reservationLimit === 0 ||
                    (restaurant.currentReservations || 0) >= restaurant.reservationLimit
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
          {menuItems.map((item, index) => {
            const offer = getMenuItemOffer(index);
            const originalPrice = item.price || 0;
            const discountedPrice = offer ? getDiscountedPrice(originalPrice, offer.percentage) : null;
            
            return (
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
                {offer && (
                  <div className="badge badge-secondary gap-2">
                    {offer.percentage}% OFF
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  {discountedPrice !== null ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                      <span className="text-2xl font-bold text-secondary">
                        ${discountedPrice.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xl font-bold text-primary">
                      ${originalPrice.toFixed(2)}
                    </span>
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
            );
          })}
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
      {showOrderModal && selectedMenuItem && (() => {
        const menuIndex = menuItems.findIndex(item => item._id === selectedMenuItem._id);
        const offer = getMenuItemOffer(menuIndex);
        const originalPrice = selectedMenuItem.price || 0;
        const discountedPrice = offer ? getDiscountedPrice(originalPrice, offer.percentage) : null;
        const finalPrice = discountedPrice !== null ? discountedPrice : originalPrice;

        return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="modal modal-open">
            <div className="modal-box w-full max-w-md">
              <h3 className="font-bold text-lg mb-4">Place Order</h3>

              <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <h4 className="font-semibold">{selectedMenuItem.name}</h4>
                <p className="text-sm text-gray-600">{selectedMenuItem.description}</p>
                {offer && (
                  <div className="badge badge-secondary gap-2 mt-2">
                    {offer.percentage}% OFF
                  </div>
                )}
                {discountedPrice !== null ? (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500 line-through mr-2">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="text-2xl font-bold text-secondary">
                      ${discountedPrice.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-primary mt-2">
                    ${originalPrice.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMakeOrder}
                  className="btn btn-primary"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Reviews Section */}
      {restaurant && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-xl mb-4">
                Customer Reviews 
                {restaurantRating && restaurantRating.totalReviews > 0 && (
                  <span className="text-sm font-normal ml-2">
                    ({restaurantRating.averageRating.toFixed(1)} ⭐ • {restaurantRating.totalReviews} review{restaurantRating.totalReviews !== 1 ? 's' : ''})
                  </span>
                )}
              </h3>

              {reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No reviews yet</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reviews.map((review) => (
                    <div key={review._id} className="bg-base-200 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.userId?.fullName || 'Anonymous'}</p>
                          {review.menuItemName && (
                            <p className="text-xs text-primary font-medium">
                              For: {review.menuItemName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <span key={i}>⭐</span>
                          ))}
                          <span className="ml-1 text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                      </div>
                      <p className="text-sm">{review.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuBrowserWindow;
