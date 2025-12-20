import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu, addOffer, getOffers, updateOffer, deleteOffer } from '../controllers/restaurantController.js';
import { getUser, updateUser, generateRefId, getUserCart, cancelOrder, confirmUserOrders } from '../controllers/userController.js';
import { getDriver, updateDriver } from '../controllers/driverController.js';
import { getRestaurantMenuItems, makeReservation, updateReservationStatus, makeOrder } from '../controllers/dashboardController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Restaurant endpoints (protected)
router.get("/get-restaurant", verifyToken, getRestaurant);
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

// Menu browser endpoints (public for get, protected for write)
router.get("/get-restaurant-menu/:restaurantId", getRestaurantMenuItems);
router.post("/make-reservation/:restaurantId", verifyToken, makeReservation);
router.put("/update-reservation-status/:restaurantId", verifyToken, updateReservationStatus);
router.post("/make-order", verifyToken, makeOrder);

// Cart endpoints (protected)
router.get("/get-user-cart", verifyToken, getUserCart);
router.delete("/cancel-order/:orderId", verifyToken, cancelOrder);
router.put("/confirm-user-orders", verifyToken, confirmUserOrders);

// Driver endpoints (protected)
router.get("/get-driver", verifyToken, getDriver);
router.put("/update-driver", verifyToken, updateDriver);

export default router;