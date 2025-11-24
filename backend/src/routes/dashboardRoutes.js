import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu } from '../controllers/restaurantController.js';

const router = express.Router();

router.get("/get-restaurant/:id", getRestaurant);
router.post("/add-menu/:id", addMenu);
router.put("/update-restaurant/:id", updateRestaurant);
router.put("/update-menu/:id/:index", updateMenu);

export default router;