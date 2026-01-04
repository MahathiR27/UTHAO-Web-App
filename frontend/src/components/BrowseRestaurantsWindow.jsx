import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import { Search, Star, Utensils } from "lucide-react";

const BrowseRestaurantsWindow = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [availableCuisines, setAvailableCuisines] = useState([]);

  // Fetch all restaurants on mount
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5001/api/dashboard/get-all-restaurants"
      );
      const data = response.data.restaurants || [];
      setRestaurants(data);
      setFilteredRestaurants(data);
      
      // Extract unique cuisines
      const cuisines = [...new Set(data.map(r => r.cuisine || "General"))];
      setAvailableCuisines(cuisines);
    } catch (error) {
      toast.error("Failed to load restaurants");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Apply search, sort, and filter
  useEffect(() => {
    let result = [...restaurants];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(restaurant =>
        restaurant.RestaurantName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply cuisine filter
    if (selectedCuisine !== "all") {
      result = result.filter(restaurant => 
        (restaurant.cuisine || "General") === selectedCuisine
      );
    }

    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.RestaurantName.localeCompare(b.RestaurantName));
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredRestaurants(result);
  }, [searchTerm, sortBy, selectedCuisine, restaurants]);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/menu-browser?id=${restaurantId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
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

  return (
    <div className="w-full">
      <div className="sticky top-[64px] z-40 bg-base-200 pb-4">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6 pt-4">
            <h2 className="text-3xl font-bold text-center mb-2">Browse Restaurants</h2>
            <p className="text-center text-gray-500">Discover amazing restaurants near you</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 bg-base-100 p-4 rounded-lg shadow-lg">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-bordered"
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="rating">Sort by Rating</option>
            </select>

            {/* Cuisine Filter */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="select select-bordered"
            >
              <option value="all">All Cuisines</option>
              {availableCuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Restaurant Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500">No restaurants found</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant._id}
                onClick={() => handleRestaurantClick(restaurant._id)}
                className="card bg-base-200 hover:bg-base-300 shadow-lg cursor-pointer transition-all duration-200 hover:scale-105"
              >
                <div className="card-body p-4">
                  {/* Restaurant Name */}
                  <h3 className="card-title text-lg font-bold mb-2">
                    {restaurant.RestaurantName}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(restaurant.rating || 0)}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({restaurant.rating ? restaurant.rating.toFixed(1) : '0.0'})
                    </span>
                  </div>

                  {/* Cuisine Badge */}
                  <div className="mb-2">
                    <span className="badge badge-primary badge-sm">
                      {restaurant.cuisine || "General"}
                    </span>
                  </div>

                  {/* Description */}
                  {restaurant.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {restaurant.description}
                    </p>
                  )}

                  {/* Address */}
                  <p className="text-xs text-gray-500 mb-2">
                    📍 {restaurant.address}
                  </p>

                  {/* Menu Count */}
                  <div className="flex items-center gap-2 mt-2">
                    <Utensils className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {restaurant.menu?.length || 0} items on menu
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm">View Menu</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseRestaurantsWindow;
