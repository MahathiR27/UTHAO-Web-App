import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu } from '../controllers/restaurantController.js';
import { getUser, updateUser, generateRefId, getUserCart, cancelOrder, confirmUserOrders } from '../controllers/userController.js';
import { getRestaurantMenuItems, makeReservation, updateReservationStatus, makeOrder } from '../controllers/dashboardController.js';

const router = express.Router();

// Restaurant endpoints
router.get("/get-restaurant/:id", getRestaurant);
router.post("/add-menu/:id", addMenu);
router.put("/update-restaurant/:id", updateRestaurant);
router.put("/update-menu/:id/:index", updateMenu);

// User endpoints
router.get("/get-user/:id", getUser);
router.put("/update-user/:id", updateUser);
router.post("/generate-refid/:id", generateRefId);

// Menu browser endpoints
router.get("/get-restaurant-menu/:restaurantId", getRestaurantMenuItems);
router.post("/make-reservation/:restaurantId", makeReservation);
router.put("/update-reservation-status/:restaurantId", updateReservationStatus);
router.post("/make-order", makeOrder);

// Cart endpoints
router.get("/get-user-cart/:userId", getUserCart);
router.delete("/cancel-order/:orderId", cancelOrder);
router.put("/confirm-user-orders/:userId", confirmUserOrders);

export default router;