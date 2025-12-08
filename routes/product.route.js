import express from "express";
import multer from "multer";
import { isLogin, isSeller } from "../middleware/authCheck.js";
import {
  createProductController,
  updateProductController,
  deleteProductController,
  getSellerProductsController,
  getAllProductsController,
  getProductByIdController,
  getProductPhotoController,
  getProductsByCategoryController,
} from "../controller/product.controller.js";

const upload = multer();

const router = express.Router();

// ------ Public Routes
// Get all products
router.get("/all", getAllProductsController);
// Get single product by id
router.get("/:pid", getProductByIdController);
// Get product photo
router.get("/photo/:pid", getProductPhotoController);
// Get products by category
router.get("/category/:cid", getProductsByCategoryController);

// ------ Seller Routes (CRUD by Seller)
// Create product (Seller only)
router.post(
  "/create",
  isLogin,
  isSeller,
  upload.single("photo"),
  createProductController
);
// Update product (Seller only - own products)
router.put(
  "/update/:pid",
  isLogin,
  isSeller,
  upload.single("photo"),
  updateProductController
);
// Delete product (Seller only - own products)
router.delete("/delete/:pid", isLogin, isSeller, deleteProductController);
// Get seller's own products
router.get("/seller/my-products", isLogin, isSeller, getSellerProductsController);

export default router;
