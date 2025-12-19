import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import Order from "../modules/orderSchema.js";

// ----------------------------------------- REGISTRATION -----------------------------------------
export const createUser = async (req, res) => {
    try {
        
        const { UserName, email, password, phone, address } = req.body;

        if (!UserName || !email || !password || !phone) {
            return res.status(400).json({message: "All fields are required"});
        }

        const newUser = new User(
            {
                UserName, email, password, phone, address
            }
        );
        
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch(err) {
        console.error(err);
        return res.status(500).json({message: "Server error"})
    }
};

// ----------------------------------------- Dashboard -----------------------------------------
export const getUser = async (req, res) => {
    try {
        // Get user ID from JWT token
        const userId = req.user.id;

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: "User not found" });

        return res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        // Get user ID from JWT token
        const userId = req.user.id;
        const updates = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update allowed fields
        const allowed = ["UserName", "email", "phone", "address"];

        allowed.forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(updates, key)) {
                user[key] = updates[key];
            }
        });

        await user.save();
        return res.status(200).json({ message: "User updated", user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const generateRefId = async (req, res) => {
    try {
        // Get user ID from JWT token
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check if refId already exists
        if (user.refId) {
            return res.status(400).json({ message: "Reference ID already exists", refId: user.refId });
        }

        // Generate unique reference ID
        const refId = `USR-${user._id}`;

        user.refId = refId;
        await user.save();

        return res.status(200).json({ message: "Reference ID generated successfully", refId: user.refId, user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ----------------------------------------- User Orders -----------------------------------------

// Get user's cart (pending orders with menu item details)
export const getUserCart = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user.id;

    // Get user with orders
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get pending orders with menu item details
    const cartOrders = [];

    for (const userOrder of user.orders || []) {
      if (userOrder.status === 'pending') {
        // Get restaurant to find menu item name
        const restaurant = await Restaurant.findById(userOrder.restaurantId);
        if (restaurant) {
          // Find menu item by ID (generated as restaurantId-index)
          const menuItemIndex = userOrder.menuItemId.split('-').pop();
          const menuItem = restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;

          cartOrders.push({
            _id: userOrder.orderId,
            menuItemName: menuItem ? menuItem.name : 'Unknown Item',
            restaurantName: restaurant.RestaurantName,
            price: userOrder.price,
            deliveryAddress: userOrder.deliveryAddress,
            date: userOrder.date
          });
        }
      }
    }

    return res.status(200).json({
      cartOrders,
      count: cartOrders.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Cancel an order (remove from all places)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID required" });
    }

    // Find and delete the order document
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Remove from user's orders array
    const user = await User.findById(order.userId);
    if (user) {
      user.orders = user.orders.filter(o => !o.orderId.equals(orderId));
      await user.save();
    }

    // Remove from restaurant's orders array
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant) {
      restaurant.orders = restaurant.orders.filter(o => !o.orderId.equals(orderId));
      await restaurant.save();
    }

    // Delete the order document
    await Order.findByIdAndDelete(orderId);

    return res.status(200).json({
      message: "Order cancelled successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Confirm all pending orders for a user
export const confirmUserOrders = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update all pending orders to confirmed
    const orderIds = user.orders
      .filter(order => order.status === 'pending')
      .map(order => order.orderId);

    // Update Order documents
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { status: 'confirmed' }
    );

    // Update user's orders array
    user.orders = user.orders.map(order => 
      order.status === 'pending' 
        ? { ...order.toObject(), status: 'confirmed' }
        : order
    );
    await user.save();

    // Update restaurants' orders arrays
    for (const order of user.orders) {
      if (order.status === 'confirmed') {
        const restaurant = await Restaurant.findById(order.restaurantId);
        if (restaurant) {
          restaurant.orders = restaurant.orders.map(rOrder =>
            rOrder.orderId.equals(order.orderId)
              ? { ...rOrder.toObject(), status: 'confirmed' }
              : rOrder
          );
          await restaurant.save();
        }
      }
    }

    return res.status(200).json({
      message: "All orders confirmed successfully"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
