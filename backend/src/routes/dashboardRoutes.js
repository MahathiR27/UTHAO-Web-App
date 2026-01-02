import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu, addOffer, getOffers, updateOffer, deleteOffer, rateRestaurant, getRestaurantReviews } from '../controllers/restaurantController.js';
import { getUser, updateUser, generateRefId, getUserCart, cancelOrder, confirmUserOrders, getPromocodes, validatePromocode, applyPromocode, getUserOrders } from '../controllers/userController.js';
import { getDriver, updateDriver } from '../controllers/driverController.js';
import { getRestaurantMenuItems, makeReservation, updateReservationStatus, makeOrder } from '../controllers/dashboardController.js';
import { calculateFare, createRideRequest, getRequestedRides, acceptRideRequest, getRideStatus, cancelRideRequest, updateRideStatus, rateDriver } from '../controllers/rideController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Restaurant endpoints (protected)
router.get("/get-restaurant", verifyToken, getRestaurant);
router.get("/get-restaurant-reviews", verifyToken, getRestaurantReviews);
router.post("/add-menu", verifyToken, addMenu);
router.put("/update-restaurant", verifyToken, updateRestaurant);
router.put("/update-menu/:index", verifyToken, updateMenu);

// Offer endpoints (protected)
router.post("/add-offer", verifyToken, addOffer);
router.get("/get-offers", verifyToken, getOffers);
router.put("/update-offer/:index", verifyToken, updateOffer);
router.delete("/delete-offer/:index", verifyToken, deleteOffer);

// User endpoints (protected)
router.get("/get-user", verifyToken, getUser);
router.put("/update-user", verifyToken, updateUser);
router.post("/generate-refid", verifyToken, generateRefId);

// Promocode endpoints (protected)
router.get("/get-promocodes", verifyToken, getPromocodes);
router.post("/validate-promocode", verifyToken, validatePromocode);
router.post("/apply-promocode", verifyToken, applyPromocode);

// Menu browser endpoints (public for get, protected for write)
router.get("/get-restaurant-menu/:restaurantId", getRestaurantMenuItems);
router.post("/make-reservation/:restaurantId", verifyToken, makeReservation);
router.put("/update-reservation-status/:restaurantId", verifyToken, updateReservationStatus);
router.post("/make-order", verifyToken, makeOrder);

// Cart endpoints (protected)
router.get("/get-user-cart", verifyToken, getUserCart);
router.get("/get-user-orders", verifyToken, getUserOrders);
router.delete("/cancel-order/:orderId", verifyToken, cancelOrder);
router.put("/confirm-user-orders", verifyToken, confirmUserOrders);

// Driver endpoints (protected)
router.get("/get-driver", verifyToken, getDriver);
router.put("/update-driver", verifyToken, updateDriver);

// Ride endpoints
router.post("/calculate-fare", calculateFare);
router.post("/create-ride-request", verifyToken, createRideRequest);
router.get("/get-requested-rides", verifyToken, getRequestedRides);
router.post("/accept-ride", verifyToken, acceptRideRequest);
router.get("/ride-status/:rideId", verifyToken, getRideStatus);
router.put("/cancel-ride/:rideId", verifyToken, cancelRideRequest);
router.put("/update-ride-status", verifyToken, updateRideStatus);
router.post("/rate-driver", verifyToken, rateDriver);
router.post("/rate-restaurant", verifyToken, rateRestaurant);

export default router;