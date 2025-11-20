import express from "express";
import multer from "multer";
import { isAdmin, isLogin } from "../middleware/authCheck.js";
import {
    adminUpdateUserPassword,
  createCategoryController,
  deleteCategoryById,
  updateCategoryById,
} from "../controller/admin.controller.js";

const upload = multer();

const router = express.Router();

// --------------- Categories ---------------
// create category
router.post(
  "/create",
  isLogin,
  isAdmin,
  upload.single("photo"),
  createCategoryController
);
// update by id (By Admin)
router.put(
  "/update/:cid",
  isLogin,
  isAdmin,
  upload.single("photo"),
  updateCategoryById
);
// Delete by id (By Admin)
router.delete("/delete/:cid", isLogin, isAdmin, deleteCategoryById);


// ------------- User
// Update password (By admin)
router.put("/update-passowrd/:userId", isLogin, isAdmin, adminUpdateUserPassword);

export default router;
