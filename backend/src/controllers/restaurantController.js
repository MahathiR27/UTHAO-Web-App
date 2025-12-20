import Restaurant from "../modules/restaurantReg.js";

export const  createRestaurant = async (req, res) => {
    try {
        
        const { RestaurantName, OwnerName, description, address, email, RestaurantPhone, OwnerPhone, UserName, password } = req.body;

        if (!RestaurantName || !OwnerName || !address || !email || !RestaurantPhone || !UserName || !password) {
            return res.status(400).json({message: "All fields are required (including UserName and password)"});
        }

        const newRestaurant = new Restaurant(
            {
                RestaurantName, OwnerName, description, address, email, RestaurantPhone, OwnerPhone, UserName, password
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

export const updateRestaurant = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;
        const updates = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        // Update allowed fields
        const allowed = [
            "RestaurantName",
            "OwnerName",
            "description",
            "address",
            "email",
            "RestaurantPhone",
            "OwnerPhone",
            "reservationLimit",
        ];

        allowed.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                restaurant[key] = updates[key];
            }
        });

        await restaurant.save();
        return res.status(200).json({ message: "Restaurant updated", restaurant });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateMenu = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;
        const { index } = req.params;
        const { name, price, description } = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        const idx = Number(index);
        if (Number.isNaN(idx) || !restaurant.menu || idx < 0 || idx >= restaurant.menu.length) {
            return res.status(400).json({ message: "Invalid menu index" });
        }

        if (name !== undefined) restaurant.menu[idx].name = name;
        if (price !== undefined) restaurant.menu[idx].price = Number(price) || 0;
        if (description !== undefined) restaurant.menu[idx].description = description;

        await restaurant.save();
        return res.status(200).json({ message: "Menu updated", menu: restaurant.menu });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getRestaurant = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;

        const restaurant = await Restaurant.findById(restaurantId)
            .populate('reservations')
            .populate('orders')
            .lean();
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        return res.status(200).json({ restaurant });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

export const addMenu = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;
        const { name, price, description } = req.body;

        if (!name) return res.status(400).json({ message: "Menu item name is required" });

        const restaurant = await Restaurant.findById(restaurantId);
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
