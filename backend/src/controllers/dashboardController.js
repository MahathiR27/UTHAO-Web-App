import Restaurant from "../modules/restaurantReg.js";

// Get all menu items from all restaurants with restaurant info
export const getAllMenuItems = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().lean();
    
    // Flatten all menu items with their restaurant info
    const allMenuItems = [];
    
    restaurants.forEach((restaurant) => {
      if (restaurant.menu && restaurant.menu.length > 0) {
        restaurant.menu.forEach((item, index) => {
          allMenuItems.push({
            _id: `${restaurant._id}-${index}`, // Unique ID for each menu item
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image || null,
            restaurantId: restaurant._id,
            restaurantName: restaurant.RestaurantName,
            restaurantAddress: restaurant.address,
            restaurantEmail: restaurant.email,
            restaurantPhone: restaurant.RestaurantPhone,
          });
        });
      }
    });

    return res.status(200).json({ 
      items: allMenuItems,
      count: allMenuItems.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get menu items for a specific restaurant
export const getRestaurantMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID required" });
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItems = (restaurant.menu || []).map((item, index) => ({
      _id: `${restaurant._id}-${index}`,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image || null,
    }));

    return res.status(200).json({
      restaurant,
      menuItems,
      count: menuItems.length,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
