import express from 'express';
import { createRestaurant } from '../controllers/restaurantController.js';

const router = express.Router();

router.post("/create-restaurant", createRestaurant);

export default router;