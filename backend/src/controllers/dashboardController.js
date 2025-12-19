import Restaurant from "../modules/restaurantReg.js";
import User from "../modules/userReg.js";
import Order from "../modules/orderSchema.js";

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

// Make a reservation
export const makeReservation = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    // Get user ID from JWT token
    const userId = req.user.id;
    const { name, address, date, numberOfPeople } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID required" });
    }

    if (!name || !address || !date || !numberOfPeople) {
      return res.status(400).json({ message: "All reservation fields are required" });
    }

    const peopleCount = parseInt(numberOfPeople);
    if (peopleCount <= 0) {
      return res.status(400).json({ message: "Number of people must be greater than 0" });
    }

    // Get restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check reservation limit
    const currentReservations = restaurant.reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length;
    if (currentReservations + peopleCount > restaurant.reservationLimit) {
      return res.status(400).json({ message: "Reservation limit exceeded for this restaurant" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create reservation object
    const reservation = {
      userId,
      name,
      address,
      date: new Date(date),
      numberOfPeople: peopleCount,
      status: 'pending',
      createdAt: new Date()
    };

    // Add to restaurant reservations
    restaurant.reservations.push(reservation);
    await restaurant.save();

    // Add to user reservations
    user.reservations.push({
      restaurantId,
      name,
      address,
      date: new Date(date),
      numberOfPeople: peopleCount,
      status: 'pending',
      createdAt: new Date()
    });
    await user.save();

    return res.status(201).json({
      message: "Reservation created successfully",
      reservation: {
        id: restaurant.reservations[restaurant.reservations.length - 1]._id,
        ...reservation
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update reservation status
export const updateReservationStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { reservationId, status } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID required" });
    }

    if (!reservationId || !status) {
      return res.status(400).json({ message: "Reservation ID and status are required" });
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be pending, confirmed, or cancelled" });
    }

    // Get restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Find and update reservation in restaurant
    const reservationIndex = restaurant.reservations.findIndex(r => r._id.toString() === reservationId);
    if (reservationIndex === -1) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const oldStatus = restaurant.reservations[reservationIndex].status;
    restaurant.reservations[reservationIndex].status = status;
    await restaurant.save();

    // Update reservation in user document
    const userId = restaurant.reservations[reservationIndex].userId;
    const user = await User.findById(userId);
    if (user) {
      const userReservationIndex = user.reservations.findIndex(r => 
        r.restaurantId.toString() === restaurantId && 
        r.date.toISOString() === restaurant.reservations[reservationIndex].date.toISOString() &&
        r.name === restaurant.reservations[reservationIndex].name
      );
      
      if (userReservationIndex !== -1) {
        user.reservations[userReservationIndex].status = status;
        await user.save();
      }
    }

    return res.status(200).json({
      message: "Reservation status updated successfully",
      restaurant
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Make an order
export const makeOrder = async (req, res) => {
  try {
    // Get user ID from JWT token
    const userId = req.user.id;
    const { restaurantId, menuItemId, price, deliveryAddress } = req.body;

    if (!restaurantId || !menuItemId || !price || !deliveryAddress) {
      return res.status(400).json({ message: "All order fields are required" });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Create the order
    const newOrder = new Order({
      userId,
      restaurantId,
      menuItemId,
      price,
      deliveryAddress,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // Add order to user's orders array
    user.orders.push({
      orderId: savedOrder._id,
      restaurantId,
      menuItemId,
      date: savedOrder.createdAt,
      price,
      deliveryAddress,
      status: 'pending'
    });

    await user.save();

    // Add order to restaurant's orders array
    restaurant.orders.push({
      orderId: savedOrder._id,
      userId,
      menuItemId,
      date: savedOrder.createdAt,
      price,
      deliveryAddress,
      status: 'pending'
    });

    await restaurant.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
