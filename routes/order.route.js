import express from "express";
import { isLogin, isSeller } from "../middleware/authCheck.js";
import {
  createOrderController,
  getUserOrdersController,
  getSellerOrdersController,
  updateOrderStatusController,
  getOrderByIdController,
} from "../controller/order.controller.js";

const router = express.Router();

// Buyer routes
router.post("/create", isLogin, createOrderController);
router.get("/my-orders", isLogin, getUserOrdersController);
router.get("/:orderId", isLogin, getOrderByIdController);

// Seller routes
router.get("/seller/orders", isLogin, isSeller, getSellerOrdersController);
router.put("/seller/update-status/:orderId", isLogin, isSeller, updateOrderStatusController);

export default router;
