import express from "express";
import multer from "multer";
import { isAdmin, isLogin } from "../middleware/authCheck.js";
import {
  adminCreateCategoryController,
  adminDeleteCategoryById,
  adminDeleteProductController,
  adminDeleteUserControllerById,
  adminGetAllUsersController,
  adminUpdateCategoryById,
  adminUpdateUserInfoControllerById,
  adminUpdateUserPasswordById,
} from "../controller/admin.controller.js";

const upload = multer();

const router = express.Router();

// --------------- Categories ---------------
// create category
router.post(
  "/create-category",
  isLogin,
  isAdmin,
  upload.single("photo"),
  adminCreateCategoryController
);
// update by id (By Admin)
router.put(
  "/update-category/:cid",
  isLogin,
  isAdmin,
  upload.single("photo"),
  adminUpdateCategoryById
);
// Delete by id (By Admin)
router.delete(
  "/delete-category/:cid",
  isLogin,
  isAdmin,
  adminDeleteCategoryById
);

// ------------- User -------------
// Update password (By admin)
router.put(
  "/update-user-passowrd/:userId",
  isLogin,
  isAdmin,
  adminUpdateUserPasswordById
);
router.put(
  "/update-user/:userId",
  isLogin,
  isAdmin,
  adminUpdateUserInfoControllerById
);
router.delete(
  "/delete-user/:userId",
  isLogin,
  isAdmin,
  adminDeleteUserControllerById
);
router.get(
  "/get-all-users",
  isLogin,
  isAdmin,
  adminGetAllUsersController
);

// ------------- Products -------------
// Delete product (By Admin)
router.delete("/delete-product/:pid", isLogin, isAdmin, adminDeleteProductController);

export default router;
