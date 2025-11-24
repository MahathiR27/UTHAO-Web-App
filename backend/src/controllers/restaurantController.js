import Restaurant from "../modules/restaurantReg.js";

export const  createRestaurant = async (req, res) => {
    try {
        
        const { RestaurantName, OwnerName, description, address, email, RestaurantPhone, OwnerPhone } = req.body;

        if (!RestaurantName || !OwnerName || !address || !email || !RestaurantPhone) {
            return res.status(400).json({message: "All fields are required"});
        }

        const newRestaurant = new Restaurant(
            {
                RestaurantName, OwnerName, description, address, email, RestaurantPhone, OwnerPhone
            }
        );
        
        await newRestaurant.save();

        return res.status(201).json({
            message: "Restaurant registered successfully",
            restaurant: newRestaurant
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({message: "Server error"})
    }
};

export const getRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Restaurant id required" });

        const restaurant = await Restaurant.findById(id).lean();
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        return res.status(200).json({ restaurant });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export const addMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        if (!id) return res.status(400).json({ message: "Restaurant id required" });
        if (!name) return res.status(400).json({ message: "Menu item name is required" });

        const restaurant = await Restaurant.findById(id);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        restaurant.menu = restaurant.menu || [];
        restaurant.menu.push({ name, price: price ? Number(price) : 0, description });

        await restaurant.save();

        return res.status(201).json({ message: "Menu item added", menu: restaurant.menu });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}
