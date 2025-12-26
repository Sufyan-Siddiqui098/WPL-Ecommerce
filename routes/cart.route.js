import express from "express";
import { isLogin } from "../middleware/authCheck.js";
import {
  getCartController,
  addToCartController,
  removeFromCartController,
  clearCartController,
  updateCartItemController,
} from "../controller/cart.controller.js";

const router = express.Router();

// All cart routes require user to be logged in

// Get user's cart
router.get("/", isLogin, getCartController);

// Add item to cart
router.post("/add", isLogin, addToCartController);

// Update item quantity in cart
router.put("/update/:productId", isLogin, updateCartItemController);

// Remove item from cart
router.delete("/remove/:productId", isLogin, removeFromCartController);

// Clear entire cart
router.delete("/clear", isLogin, clearCartController);

export default router;
