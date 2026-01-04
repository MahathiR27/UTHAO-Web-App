import Order from "../modules/orderSchema.js";
import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import { sendOrderReceipt } from "./emailService.js";

// Get all confirmed food orders available for delivery (for drivers)
export const getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Order.find({ 
      status: "confirmed",
      driverId: null 
    })
      .populate("userId", "fullName phone")
      .populate("restaurantId", "RestaurantName address phone")
      .sort({ createdAt: -1 });

    // Populate menu item details
    const deliveriesWithDetails = [];
    for (const order of deliveries) {
      const restaurant = await Restaurant.findById(order.restaurantId);
      if (restaurant) {
        const menuItemIndex = order.menuItemId.split('-').pop();
        const menuItem = restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;

        deliveriesWithDetails.push({
          _id: order._id,
          userId: order.userId,
          restaurantName: restaurant.RestaurantName,
          restaurantAddress: restaurant.address,
          restaurantPhone: restaurant.RestaurantPhone,
          menuItemName: menuItem ? menuItem.name : 'Unknown Item',
          menuItemDescription: menuItem ? menuItem.description : '',
          price: order.price,
          deliveryAddress: order.deliveryAddress,
          orderedAt: order.createdAt,
          status: order.status
        });
      }
    }

    return res.status(200).json(deliveriesWithDetails);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get driver's active delivery (delivering status)
export const getDriverActiveDelivery = async (req, res) => {
  try {
    const driverId = req.user.id; // Get driver ID from JWT token

    const activeDelivery = await Order.findOne({
      driverId: driverId,
      status: "delivering"
    })
      .populate("userId", "fullName phone")
      .populate("restaurantId", "RestaurantName address phone")
      .sort({ acceptedAt: -1 });

    if (!activeDelivery) {
      return res.status(200).json({ activeDelivery: null });
    }

    // Get menu item details
    const restaurant = await Restaurant.findById(activeDelivery.restaurantId);
    const menuItemIndex = activeDelivery.menuItemId.split('-').pop();
    const menuItem = restaurant && restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;

    const deliveryDetails = {
      _id: activeDelivery._id,
      userId: activeDelivery.userId,
      restaurantName: restaurant ? restaurant.RestaurantName : 'Unknown Restaurant',
      restaurantAddress: restaurant ? restaurant.address : '',
      restaurantPhone: restaurant ? restaurant.RestaurantPhone : '',
      menuItemName: menuItem ? menuItem.name : 'Unknown Item',
      menuItemDescription: menuItem ? menuItem.description : '',
      price: activeDelivery.price,
      deliveryAddress: activeDelivery.deliveryAddress,
      orderedAt: activeDelivery.createdAt,
      acceptedAt: activeDelivery.acceptedAt,
      status: activeDelivery.status
    };

    return res.status(200).json({ activeDelivery: deliveryDetails });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Accept a delivery request
export const acceptDelivery = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

    if (!orderId || !driverId) {
      return res.status(400).json({ message: "Order ID and Driver ID are required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "confirmed") {
      return res.status(400).json({ message: "Order is not available for delivery" });
    }

    if (order.driverId) {
      return res.status(400).json({ message: "Order already accepted by another driver" });
    }

    order.driverId = driverId;
    order.status = "delivering";
    order.acceptedAt = new Date();

    await order.save();

    return res.status(200).json({
      message: "Delivery accepted successfully",
      order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Complete a delivery
export const completeDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;
    const driverId = req.user.id;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.driverId.toString() !== driverId) {
      return res.status(403).json({ message: "This delivery does not belong to you" });
    }

    if (order.status !== "delivering") {
      return res.status(400).json({ message: "Order is not in delivering status" });
    }

    order.status = "delivered";
    order.deliveredAt = new Date();

    await order.save();

    // Send email receipt to the user
    try {
      const user = await User.findById(order.userId);
      const restaurant = await Restaurant.findById(order.restaurantId);
      
      if (user && user.email && restaurant) {
        const menuItemIndex = order.menuItemId.split('-').pop();
        const menuItem = restaurant.menu ? restaurant.menu[parseInt(menuItemIndex)] : null;
        
        const orderDetails = {
          restaurantName: restaurant.RestaurantName,
          menuItemName: menuItem ? menuItem.name : 'Food Order',
          price: order.price,
          deliveryAddress: order.deliveryAddress,
          deliveredAt: order.deliveredAt.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
        
        await sendOrderReceipt(user.email, user.fullName, orderDetails);
      }
    } catch (emailError) {
      console.error("Failed to send order receipt email:", emailError);
      // Don't fail the delivery completion if email fails
    }

    return res.status(200).json({
      message: "Delivery completed successfully",
      order
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get delivery status for specific order
export const getDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID required" });
    }

    const order = await Order.findById(orderId)
      .populate("userId", "fullName phone")
      .populate("restaurantId", "RestaurantName")
      .populate("driverId", "fullName phone carModel carColor licensePlate");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
