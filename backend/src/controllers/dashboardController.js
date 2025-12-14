import Restaurant from "../modules/restaurantReg.js";

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
