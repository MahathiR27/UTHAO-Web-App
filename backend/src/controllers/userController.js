import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import Order from "../modules/orderSchema.js";
import Reservation from "../modules/reservationSchema.js";
import RideRequest from "../modules/rideRequestSchema.js";

// ----------------------------------------- REGISTRATION -----------------------------------------
export const createUser = async (req, res) => {
    try {
        
        const { fullName, UserName, email, password, phone, address } = req.body;

        if (!fullName || !UserName || !email || !password || !phone) {
            return res.status(400).json({message: "All fields are required"});
        }

        const newUser = new User(
            {
                fullName, UserName, email, password, phone, address
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

        const user = await User.findById(userId)
            .populate('reservations')
            .populate('orders')
            .lean();
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

    // Get user with populated orders
    const user = await User.findById(userId).populate('orders');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Filter pending orders and get menu item details
    const cartOrders = [];

    for (const order of user.orders || []) {
      if (order.status === 'pending') {
        // Get restaurant to find menu item name
        const restaurant = await Restaurant.findById(order.restaurantId);
        if (restaurant) {
          // Find menu item by ID (generated as restaurantId-index)
          const menuItemIndex = order.menuItemId.split('-').pop();
          const menuItem = restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;

          cartOrders.push({
            _id: order._id,
            menuItemName: menuItem ? menuItem.name : 'Unknown Item',
            restaurantName: restaurant.RestaurantName,
            price: order.price,
            deliveryAddress: order.deliveryAddress,
            date: order.date || order.createdAt
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
      user.orders = user.orders.filter(id => !id.equals(orderId));
      await user.save();
    }

    // Remove from restaurant's orders array
    const restaurant = await Restaurant.findById(order.restaurantId);
    if (restaurant) {
      restaurant.orders = restaurant.orders.filter(id => !id.equals(orderId));
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

    const user = await User.findById(userId).populate('orders');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get pending order IDs
    const pendingOrders = user.orders.filter(order => order.status === 'pending');
    const orderIds = pendingOrders.map(order => order._id);

    // Update Order documents
    await Order.updateMany(
      { _id: { $in: orderIds } },
      { status: 'confirmed' }
    );

    return res.status(200).json({
      message: "All orders confirmed successfully",
      confirmedCount: orderIds.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ----------------------------------------- Order History -----------------------------------------

// Get user's completed order history
export const getUserOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all completed food orders
    const completedOrders = await Order.find({
      userId: userId,
      status: 'delivered'
    }).sort({ createdAt: -1 }).lean();

    // Populate menu item details
    const orderHistory = [];
    for (const order of completedOrders) {
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (restaurant) {
        const menuItemIndex = order.menuItemId.split('-').pop();
        const menuItem = restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;

        orderHistory.push({
          _id: order._id,
          type: 'food',
          date: order.createdAt,
          restaurantName: restaurant.RestaurantName,
          menuItemName: menuItem ? menuItem.name : 'Unknown Item',
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.price,
          status: order.status
        });
      }
    }

    // Get all completed rides
    const completedRides = await RideRequest.find({
      userId: userId,
      status: 'completed'
    }).sort({ completedAt: -1 }).lean();

    const rideHistory = completedRides.map(ride => ({
      _id: ride._id,
      type: 'ride',
      date: ride.completedAt || ride.requestedAt,
      destination: ride.to.address,
      fromAddress: ride.from.address,
      distance: ride.distance,
      duration: ride.duration,
      totalCost: ride.price,
      status: ride.status
    }));

    // Combine and sort by date
    const allHistory = [...orderHistory, ...rideHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    return res.status(200).json({
      history: allHistory,
      foodOrders: orderHistory.length,
      rides: rideHistory.length,
      total: allHistory.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user's ongoing orders and rides
export const getUserOngoingActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get ongoing food orders (confirmed, preparing, delivering)
    const ongoingOrders = await Order.find({
      userId: userId,
      status: { $in: ['confirmed', 'preparing', 'delivering'] }
    }).sort({ createdAt: -1 }).lean();

    // Populate menu item details
    const ongoingFoodOrders = [];
    for (const order of ongoingOrders) {
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (restaurant) {
        const menuItemIndex = order.menuItemId.split('-').pop();
        const menuItem = restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;

        ongoingFoodOrders.push({
          _id: order._id,
          type: 'food',
          restaurantName: restaurant.RestaurantName,
          menuItemName: menuItem ? menuItem.name : 'Unknown Item',
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.price,
          status: order.status,
          orderedAt: order.createdAt
        });
      }
    }

    // Get ongoing rides (accepted, started)
    const ongoingRides = await RideRequest.find({
      userId: userId,
      status: { $in: ['accepted', 'started'] }
    }).sort({ requestedAt: -1 }).lean();

    const ongoingRideRequests = ongoingRides.map(ride => ({
      _id: ride._id,
      type: 'ride',
      destination: ride.to.address,
      fromAddress: ride.from.address,
      estimatedTime: ride.duration,
      distance: ride.distance,
      totalCost: ride.price,
      status: ride.status,
      requestedAt: ride.requestedAt
    }));

    return res.status(200).json({
      ongoingOrders: ongoingFoodOrders,
      ongoingRides: ongoingRideRequests,
      totalOngoing: ongoingFoodOrders.length + ongoingRideRequests.length
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
