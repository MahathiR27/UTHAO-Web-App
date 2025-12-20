import express from 'express';
import { createUser } from '../controllers/userController.js';
import { createRestaurant } from '../controllers/restaurantController.js';
import { createDriver } from '../controllers/driverController.js';

const router = express.Router();

router.post("/create-user", createUser);
router.post("/create-restaurant", createRestaurant);
router.post("/create-driver", createDriver);

export default router;
