import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu } from '../controllers/restaurantController.js';
import { getUser, updateUser } from '../controllers/userController.js';
import { getRider, updateRider, updateRiderRating } from '../controllers/riderController.js';

const router = express.Router();

router.get("/get-restaurant/:id", getRestaurant);
router.post("/add-menu/:id", addMenu);
router.put("/update-restaurant/:id", updateRestaurant);
router.put("/update-menu/:id/:index", updateMenu);

// minimal helper endpoints for dashboards
router.get('/get-user/:id', getUser);
router.get('/get-rider/:id', getRider);
router.put('/update-user/:id', updateUser);
router.put('/update-rider/:id', updateRider);
router.put('/update-rider-rating/:id', updateRiderRating);

export default router;