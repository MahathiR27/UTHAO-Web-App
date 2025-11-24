import express from 'express';
import { getRestaurant, addMenu } from '../controllers/restaurantController.js';

const router = express.Router();

router.get("/get-restaurant/:id", getRestaurant);
router.post("/add-menu/:id", addMenu);

export default router;