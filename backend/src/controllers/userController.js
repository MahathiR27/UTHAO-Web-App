import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import Order from "../modules/orderSchema.js";
import Reservation from "../modules/reservationSchema.js";
import { sendPromocode } from "./emailService.js";

// Helper function to generate random promocode with uniqueness check
const generateRandomPromocode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Check if code already exists in any user's promocodes
        const existingUser = await User.findOne({ 'promocodes.code': code });
        if (!existingUser) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique promocode');
    }

    return code;
};

// Helper function to generate random discount (1-50%)
const generateRandomDiscount = () => {
    return Math.floor(Math.random() * 50) + 1;
};

// ----------------------------------------- REGISTRATION -----------------------------------------
export const createUser = async (req, res) => {
    try {
        
        const { fullName, UserName, email, password, phone, address, referralCode } = req.body;

        if (!fullName || !UserName || !email || !password || !phone) {
            return res.status(400).json({message: "All fields are required"});
        }

        // Check if referral code provided
        let promocodes = [];
        let referralWarning = null;
        if (referralCode && referralCode.trim()) {
            // Validate referral code exists
            const referrer = await User.findOne({ refId: referralCode });
            if (!referrer) {
                // Don't block registration, just warn user
                referralWarning = "Invalid referral code. Registration completed without promotional codes.";
            } else {
                // Generate 3 random unique promocodes
                for (let i = 0; i < 3; i++) {
                    promocodes.push({
                        code: await generateRandomPromocode(),
                        discount: generateRandomDiscount(),
                        used: false,
                        createdAt: new Date()
                    });
                }
            }
        }

        const newUser = new User(
            {
                fullName, UserName, email, password, phone, address, promocodes
            }
        );
        
        await newUser.save();

        // Send promocodes via email if any
        let emailSent = false;
        if (promocodes.length > 0) {
            try {
                await sendPromocode(email, promocodes);
                emailSent = true;
            } catch (emailError) {
                console.error("Failed to send promocode email:", emailError);
                // Continue even if email fails
            }
        }

        const responseMessage = referralWarning || 
            (promocodes.length > 0 ? "User registered successfully with referral bonus!" : "User registered successfully");

        return res.status(201).json({
            message: responseMessage,
            user: newUser,
            promocodes: promocodes.length > 0 ? promocodes : undefined,
            emailSent: promocodes.length > 0 ? emailSent : undefined,
            warning: referralWarning
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

// ----------------------------------------- Promocodes -----------------------------------------

// Get user's promocodes
export const getPromocodes = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const promocodes = user.promocodes || [];
    const availableCount = promocodes.filter(p => !p.used).length;

    return res.status(200).json({
      promocodes,
      availableCount
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Validate promocode (preview discount)
export const validatePromocode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { promocode, totalAmount } = req.body;

    if (!promocode || totalAmount === undefined) {
      return res.status(400).json({ message: "Promocode and total amount required" });
    }

    // Validate and sanitize promocode format (8 uppercase alphanumeric characters)
    const sanitizedPromocode = String(promocode).trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(sanitizedPromocode)) {
      return res.status(400).json({ message: "Invalid promocode format", valid: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const promo = user.promocodes.find(p => p.code === sanitizedPromocode);
    if (!promo) {
      return res.status(404).json({ message: "Promocode not found", valid: false });
    }

    if (promo.used) {
      return res.status(400).json({ message: "This promocode has already been used", valid: false });
    }

    const discountAmount = (totalAmount * promo.discount) / 100;
    const finalAmount = totalAmount - discountAmount;

    return res.status(200).json({
      valid: true,
      promocode: promo.code,
      discount: promo.discount,
      originalAmount: totalAmount,
      discountAmount,
      finalAmount
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Apply promocode (mark as used and return final amount)
export const applyPromocode = async (req, res) => {
  try {
    const userId = req.user.id;
    const { promocode, totalAmount, expectedFinalAmount } = req.body;

    if (!promocode || totalAmount === undefined) {
      return res.status(400).json({ message: "Promocode and total amount required" });
    }

    // Validate and sanitize promocode format (8 uppercase alphanumeric characters)
    const sanitizedPromocode = String(promocode).trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(sanitizedPromocode)) {
      return res.status(400).json({ message: "Invalid promocode format" });
    }

    // Atomically mark promocode as used to avoid race conditions
    const updatedUser = await User.findOneAndUpdate(
      { 
        _id: userId, 
        "promocodes.code": sanitizedPromocode, 
        "promocodes.used": false 
      },
      { 
        $set: { "promocodes.$.used": true } 
      },
      { new: true }
    );

    // If no document was updated, promocode was already used (possibly by concurrent request)
    if (!updatedUser) {
      return res.status(400).json({ message: "Promocode not found or already used" });
    }

    const promo = updatedUser.promocodes.find(p => p.code === sanitizedPromocode);
    const discountAmount = (totalAmount * promo.discount) / 100;
    const finalAmount = totalAmount - discountAmount;

    // Verify expected amount matches calculated amount (with small tolerance for rounding)
    if (expectedFinalAmount !== undefined && Math.abs(finalAmount - expectedFinalAmount) > 0.01) {
      return res.status(400).json({ 
        message: "Price mismatch detected. Please refresh and try again.",
        calculated: finalAmount,
        expected: expectedFinalAmount
      });
    }

    return res.status(200).json({
      message: "Promocode applied successfully",
      originalAmount: totalAmount,
      discount: promo.discount,
      discountAmount,
      finalAmount,
      promocode: promo.code
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate('restaurantId', 'RestaurantName')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      restaurantName: order.restaurantId?.RestaurantName || 'Unknown Restaurant',
      restaurantId: order.restaurantId?._id,
      menuItemId: order.menuItemId,
      price: order.price,
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: order.createdAt,
      userRating: order.userRating,
      userReview: order.userReview,
      ratedAt: order.ratedAt
    }));

    return res.status(200).json({ orders: formattedOrders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
