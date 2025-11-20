import express from "express";
import { isAdmin, isLogin } from "../middleware/authCheck.js";
import { createCategoryController, deleteCategoryById, getAllCategories, getCategoryById, updateCategoryById } from "../controller/categories.controller.js";
import multer from "multer";

const upload = multer();


const router = express.Router();

// create category (By Admin)
router.post("/create", isLogin, isAdmin, upload.single("photo"), createCategoryController);
// read all
router.get("/all", getAllCategories);
// read by id
router.get("/:cid", getCategoryById);
// update by id (By Admin)
router.put("/update/:cid", isLogin, isAdmin, upload.single("photo"), updateCategoryById);
// Delete by id (By Admin)
router.delete("/delete/:cid", isLogin, isAdmin, deleteCategoryById)

export default router;