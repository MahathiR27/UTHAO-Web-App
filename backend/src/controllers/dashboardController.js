import Restaurant from "../modules/restaurantReg.js";
import User from "../modules/userReg.js";
import Order from "../modules/orderSchema.js";
import Reservation from "../modules/reservationSchema.js";

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
    const { name, numberOfPeople } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID required" });
    }

    if (!name || !numberOfPeople) {
      return res.status(400).json({ message: "Name and number of people are required" });
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
    if (restaurant.currentReservations + peopleCount > restaurant.reservationLimit) {
      return res.status(400).json({ message: "Reservation limit exceeded for this restaurant" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new Reservation document
    const newReservation = new Reservation({
      userId,
      restaurantId,
      name,
      numberOfPeople: peopleCount,
      status: 'pending'
    });

    const savedReservation = await newReservation.save();

    // Add reservation ID to restaurant
    restaurant.reservations.push(savedReservation._id);
    restaurant.currentReservations += peopleCount;
    await restaurant.save();

    // Add reservation ID to user
    user.reservations.push(savedReservation._id);
    await user.save();

    return res.status(201).json({
      message: "Reservation created successfully",
      reservation: savedReservation
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

    // Find the Reservation document
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify it belongs to the restaurant
    if (reservation.restaurantId.toString() !== restaurantId) {
      return res.status(403).json({ message: "Reservation does not belong to this restaurant" });
    }

    const oldStatus = reservation.status;
    reservation.status = status;
    await reservation.save();

    // Update restaurant's currentReservations
    const restaurant = await Restaurant.findById(restaurantId);
    if (oldStatus === 'pending' && status === 'confirmed') {
      restaurant.currentReservations += reservation.numberOfPeople;
    } else if ((oldStatus === 'pending' || oldStatus === 'confirmed') && status === 'cancelled') {
      restaurant.currentReservations -= reservation.numberOfPeople;
    }
    await restaurant.save();

    return res.status(200).json({
      message: "Reservation status updated successfully",
      reservation
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
    const { restaurantId, menuItemId, price, deliveryAddress, date } = req.body;

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

    // Create the order document
    const newOrder = new Order({
      userId,
      restaurantId,
      menuItemId,
      date: date ? new Date(date) : new Date(),
      price,
      deliveryAddress,
      status: 'pending'
    });

    const savedOrder = await newOrder.save();

    // Add order ID to user's orders array
    user.orders.push(savedOrder._id);
    await user.save();

    // Add order ID to restaurant's orders array
    restaurant.orders.push(savedOrder._id);
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
