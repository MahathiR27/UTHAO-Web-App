import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu, addOffer, getOffers, updateOffer, deleteOffer, getAllRestaurants, getRestaurantReviews, getRestaurantRating } from '../controllers/restaurantController.js';
import { getUser, updateUser, generateRefId, getUserCart, cancelOrder, confirmUserOrders, getUserOrderHistory, getUserOngoingActivity, submitReview, checkOrderReview, addFavourite, removeFavourite, getFavourites, getUserPromoCodes } from '../controllers/userController.js';
import { getDriver, updateDriver } from '../controllers/driverController.js';
import { getRestaurantMenuItems, makeReservation, updateReservationStatus, makeOrder } from '../controllers/dashboardController.js';
import { calculateFare, createRideRequest, getRequestedRides, acceptRideRequest, getRideStatus, cancelRideRequest, updateRideStatus, getDriverActiveRide, submitDriverRating, checkRideRating, getDriverRating } from '../controllers/rideController.js';
import { getAvailableDeliveries, getDriverActiveDelivery, acceptDelivery, completeDelivery, getDeliveryStatus } from '../controllers/deliveryController.js';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadCount } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Restaurant endpoints (protected)
router.get("/get-restaurant", verifyToken, getRestaurant);
router.post("/add-menu", verifyToken, addMenu);
router.put("/update-restaurant", verifyToken, updateRestaurant);
router.put("/update-menu/:index", verifyToken, updateMenu);

// Browse restaurants endpoint (public)
router.get("/get-all-restaurants", getAllRestaurants);

// Offer endpoints (protected)
router.post("/add-offer", verifyToken, addOffer);
router.get("/get-offers", verifyToken, getOffers);
router.put("/update-offer/:index", verifyToken, updateOffer);
router.delete("/delete-offer/:index", verifyToken, deleteOffer);

// User endpoints (protected)
router.get("/get-user", verifyToken, getUser);
router.put("/update-user", verifyToken, updateUser);
router.post("/generate-refid", verifyToken, generateRefId);
router.get("/get-user-promo-codes", verifyToken, getUserPromoCodes);

// Menu browser endpoints (public for get, protected for write)
router.get("/get-restaurant-menu/:restaurantId", getRestaurantMenuItems);
router.post("/make-reservation/:restaurantId", verifyToken, makeReservation);
router.put("/update-reservation-status/:restaurantId", verifyToken, updateReservationStatus);
router.post("/make-order", verifyToken, makeOrder);

// Cart endpoints (protected)
router.get("/get-user-cart", verifyToken, getUserCart);
router.delete("/cancel-order/:orderId", verifyToken, cancelOrder);
router.put("/confirm-user-orders", verifyToken, confirmUserOrders);

// Order history endpoints (protected)
router.get("/get-order-history", verifyToken, getUserOrderHistory);
router.get("/get-ongoing-activity", verifyToken, getUserOngoingActivity);

// Driver endpoints (protected)
router.get("/get-driver", verifyToken, getDriver);
router.put("/update-driver", verifyToken, updateDriver);

// Ride endpoints
router.post("/calculate-fare", calculateFare);
router.post("/create-ride-request", verifyToken, createRideRequest);
router.get("/get-requested-rides", verifyToken, getRequestedRides);
router.get("/get-driver-active-ride", verifyToken, getDriverActiveRide);
router.post("/accept-ride", verifyToken, acceptRideRequest);
router.get("/ride-status/:rideId", verifyToken, getRideStatus);
router.put("/cancel-ride/:rideId", verifyToken, cancelRideRequest);
router.put("/update-ride-status", verifyToken, updateRideStatus);

// Delivery endpoints
router.get("/get-available-deliveries", verifyToken, getAvailableDeliveries);
router.get("/get-driver-active-delivery", verifyToken, getDriverActiveDelivery);
router.post("/accept-delivery", verifyToken, acceptDelivery);
router.put("/complete-delivery", verifyToken, completeDelivery);
router.get("/delivery-status/:orderId", verifyToken, getDeliveryStatus);

// Review endpoints
router.post("/submit-review", verifyToken, submitReview);
router.get("/check-order-review/:orderId", checkOrderReview);
router.get("/restaurant-reviews/:restaurantId", getRestaurantReviews);
router.get("/restaurant-rating/:restaurantId", getRestaurantRating);

// Favourite endpoints
router.post("/add-favourite/:restaurantId", verifyToken, addFavourite);
router.delete("/remove-favourite/:restaurantId", verifyToken, removeFavourite);
router.get("/get-favourites", verifyToken, getFavourites);

// Driver rating endpoints
router.post("/submit-driver-rating", verifyToken, submitDriverRating);
router.get("/check-ride-rating/:rideId", checkRideRating);
router.get("/driver-rating/:driverId", getDriverRating);

// Notification endpoints
router.get("/notifications", verifyToken, getNotifications);
router.put("/notifications/:notificationId/read", verifyToken, markNotificationAsRead);
router.put("/notifications/mark-all-read", verifyToken, markAllNotificationsAsRead);
router.get("/notifications/unread-count", verifyToken, getUnreadCount);

export default router;