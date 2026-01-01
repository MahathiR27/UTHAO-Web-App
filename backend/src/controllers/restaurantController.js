import Restaurant from "../modules/restaurantReg.js";
import Order from "../modules/orderSchema.js";

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

// ----------------------------------------- Offer Management -----------------------------------------

export const addOffer = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;
        const { title, percentage, menuItemIndices } = req.body;

        if (!title || percentage === undefined) {
            return res.status(400).json({ message: "Title and percentage are required" });
        }

        if (percentage < 0 || percentage > 100) {
            return res.status(400).json({ message: "Percentage must be between 0 and 100" });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        // Validate menu item indices
        const indices = menuItemIndices || [];
        for (const index of indices) {
            if (index < 0 || index >= (restaurant.menu?.length || 0)) {
                return res.status(400).json({ message: `Invalid menu item index: ${index}` });
            }
        }

        restaurant.offers = restaurant.offers || [];
        restaurant.offers.push({
            title,
            percentage: Number(percentage),
            menuItemIndices: indices,
            createdAt: new Date()
        });

        await restaurant.save();

        return res.status(201).json({ message: "Offer added successfully", offers: restaurant.offers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getOffers = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;

        const restaurant = await Restaurant.findById(restaurantId).lean();
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        return res.status(200).json({ offers: restaurant.offers || [] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateOffer = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;
        const { index } = req.params;
        const { title, percentage, menuItemIndices } = req.body;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        const idx = Number(index);
        if (!restaurant.offers || !restaurant.offers[idx]) {
            return res.status(400).json({ message: "Invalid offer index" });
        }

        if (title !== undefined) restaurant.offers[idx].title = title;
        if (percentage !== undefined) restaurant.offers[idx].percentage = Number(percentage);
        if (menuItemIndices !== undefined) restaurant.offers[idx].menuItemIndices = menuItemIndices;

        await restaurant.save();
        return res.status(200).json({ message: "Offer updated", offers: restaurant.offers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteOffer = async (req, res) => {
    try {
        // Get restaurant ID from JWT token
        const restaurantId = req.user.id;
        const { index } = req.params;

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        const idx = Number(index);
        if (!restaurant.offers || !restaurant.offers[idx]) {
            return res.status(400).json({ message: "Invalid offer index" });
        }

        restaurant.offers.splice(idx, 1);
        await restaurant.save();

        return res.status(200).json({ message: "Offer deleted", offers: restaurant.offers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const rateRestaurant = async (req, res) => {
    try {
        const userId = req.user.id;
        const { restaurantId, orderId, rating, review } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Check if order exists and belongs to user
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.userId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to rate this order" });
        }

        if (order.restaurantId.toString() !== restaurantId) {
            return res.status(400).json({ message: "Order does not belong to this restaurant" });
        }

        // Check if order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ message: "You can only rate after the order is delivered" });
        }

        // Check if already rated
        if (order.userRating) {
            return res.status(400).json({ message: "You have already rated this order" });
        }

        // Update order with rating and review
        order.userRating = rating;
        order.userReview = review || null;
        order.ratedAt = new Date();
        await order.save();

        // Update restaurant rating
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        restaurant.totalRatings = (restaurant.totalRatings || 0) + rating;
        restaurant.numberOfRatings = (restaurant.numberOfRatings || 0) + 1;
        restaurant.rating = restaurant.totalRatings / restaurant.numberOfRatings;
        await restaurant.save();

        return res.status(200).json({
            message: "Restaurant rated successfully",
            rating: restaurant.rating,
            numberOfRatings: restaurant.numberOfRatings
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getRestaurantReviews = async (req, res) => {
    try {
        const restaurantId = req.user.id;

        const orders = await Order.find({ 
            restaurantId, 
            userRating: { $ne: null }
        })
        .populate('userId', 'fullName UserName')
        .sort({ ratedAt: -1 });

        const reviews = orders.map(order => ({
            _id: order._id,
            userName: order.userId?.fullName || order.userId?.UserName || 'Anonymous',
            rating: order.userRating,
            review: order.userReview,
            ratedAt: order.ratedAt
        }));

        return res.status(200).json({ reviews });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};
