import User from "../modules/userReg.js";
import Restaurant from "../modules/restaurantReg.js";
import Order from "../modules/orderSchema.js";

// ----------------------------------------- HELPER FUNCTIONS -----------------------------------------

// Generate a random unique promocode
const generateRandomPromocode = (existingCodes = []) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        code = '';
        // Generate 8-12 character random code
        const length = Math.floor(Math.random() * 5) + 8; // 8 to 12 characters
        for (let i = 0; i < length; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        attempts++;
    } while (existingCodes.includes(code) && attempts < maxAttempts);
    
    return code;
};

// Generate random discount between 10% and 50%
const generateRandomDiscount = () => {
    // Generate discounts in multiples of 5 (10, 15, 20, 25, 30, 35, 40, 45, 50)
    const discounts = [10, 15, 20, 25, 30, 35, 40, 45, 50];
    return discounts[Math.floor(Math.random() * discounts.length)];
};

// Generate 3 unique promocodes with random discounts
const generatePromocodes = async () => {
    const promocodes = [];
    const existingCodes = [];
    
    for (let i = 0; i < 3; i++) {
        const code = generateRandomPromocode(existingCodes);
        existingCodes.push(code);
        
        promocodes.push({
            code: code,
            discount: generateRandomDiscount(),
            used: false
        });
    }
    
    return promocodes;
};

// ----------------------------------------- REGISTRATION -----------------------------------------
export const createUser = async (req, res) => {
    try {
        
        const { UserName, email, password, phone, address, referralCode } = req.body;

        if (!UserName || !email || !password || !phone) {
            return res.status(400).json({message: "All fields are required"});
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered. Please use a different email or login."
            });
        }

        // Create user object
        const userData = {
            UserName, 
            email, 
            password, 
            phone, 
            address
        };

        // Handle referral code if provided
        if (referralCode && referralCode.trim() !== '') {
            // Validate referral code exists
            const referringUser = await User.findOne({ refId: referralCode.trim() });
            
            if (!referringUser) {
                return res.status(400).json({
                    message: "Invalid referral code. The code you entered does not exist."
                });
            }

            // Prevent using referral code from the same email
            if (referringUser.email === email) {
                return res.status(400).json({
                    message: "You cannot use your own referral code."
                });
            }

            // Generate 3 random unique promocodes
            const promocodes = await generatePromocodes();

            // Create new user with promotional codes
            const newUser = new User({
                ...userData,
                promocodes: promocodes
            });

            await newUser.save();

            return res.status(201).json({
                message: "User registered successfully with referral bonus!",
                user: {
                    _id: newUser._id,
                    UserName: newUser.UserName,
                    email: newUser.email,
                    phone: newUser.phone,
                    address: newUser.address
                },
                promocodes: newUser.promocodes.map(p => ({
                    code: p.code,
                    discount: p.discount
                }))
            });
        }

        // No referral code provided - normal registration
        const newUser = new User(userData);
        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                UserName: newUser.UserName,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address
            }
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

// ----------------------------------------- Promocode Management -----------------------------------------

// Get user's available promocodes
export const getUserPromocodes = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return all promocodes with their status
        const promocodes = user.promocodes.map(promo => ({
            code: promo.code,
            discount: promo.discount,
            used: promo.used,
            createdAt: promo.createdAt
        }));

        return res.status(200).json({
            promocodes,
            availableCount: promocodes.filter(p => !p.used).length
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Validate and apply promocode (call this during checkout)
export const applyPromocode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { promocode, totalAmount } = req.body;

        if (!promocode || !totalAmount) {
            return res.status(400).json({ message: "Promocode and total amount are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the promocode - ONLY in the current user's promocodes
        const promoIndex = user.promocodes.findIndex(p => p.code === promocode);

        if (promoIndex === -1) {
            return res.status(404).json({ message: "Promocode not found or doesn't belong to you" });
        }

        const promo = user.promocodes[promoIndex];

        // Check if already used
        if (promo.used) {
            return res.status(400).json({ message: "This promocode has already been used" });
        }

        // Calculate discount
        const discountAmount = (totalAmount * promo.discount) / 100;
        const finalAmount = totalAmount - discountAmount;

        // Mark promocode as used
        user.promocodes[promoIndex].used = true;
        await user.save();

        return res.status(200).json({
            message: "Promocode applied successfully",
            originalAmount: totalAmount,
            discount: promo.discount,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
            promocode: promocode
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Validate promocode without applying (for preview)
export const validatePromocode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { promocode, totalAmount } = req.body;

        if (!promocode || !totalAmount) {
            return res.status(400).json({ message: "Promocode and total amount are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the promocode - ONLY in the current user's promocodes
        const promo = user.promocodes.find(p => p.code === promocode);

        if (!promo) {
            return res.status(404).json({ 
                message: "Promocode not found or doesn't belong to you",
                valid: false 
            });
        }

        // Check if already used
        if (promo.used) {
            return res.status(400).json({ 
                message: "This promocode has already been used",
                valid: false 
            });
        }

        // Calculate discount preview
        const discountAmount = (totalAmount * promo.discount) / 100;
        const finalAmount = totalAmount - discountAmount;

        return res.status(200).json({
            valid: true,
            promocode: promocode,
            discount: promo.discount,
            originalAmount: totalAmount,
            discountAmount: discountAmount,
            finalAmount: finalAmount
        });
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
