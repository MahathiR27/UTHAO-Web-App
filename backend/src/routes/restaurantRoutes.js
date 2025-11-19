import express from 'express';
import { createRestaurant } from '../controllers/restaurantController.js';

const router = express.Router();

router.post("/restaurantsignup", createRestaurant);

export default router;