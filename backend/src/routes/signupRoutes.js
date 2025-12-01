import express from 'express';
import { createUser } from '../controllers/userController.js';
import { createRestaurant } from '../controllers/restaurantController.js';
import { createRider } from '../controllers/riderController.js';

const router = express.Router();

router.post("/create-user", createUser);
router.post("/create-restaurant", createRestaurant);
router.post("/create-rider", createRider);

export default router;
