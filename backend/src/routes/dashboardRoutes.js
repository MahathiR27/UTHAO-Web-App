import express from 'express';
import { getRestaurant, addMenu, updateRestaurant, updateMenu } from '../controllers/restaurantController.js';
import { getUser, updateUser, generateRefId } from '../controllers/userController.js';

const router = express.Router();

router.get("/get-restaurant/:id", getRestaurant);
router.post("/add-menu/:id", addMenu);
router.put("/update-restaurant/:id", updateRestaurant);
router.put("/update-menu/:id/:index", updateMenu);

router.get("/get-user/:id", getUser);
router.put("/update-user/:id", updateUser);
router.post("/generate-refid/:id", generateRefId);

export default router;