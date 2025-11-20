import express from "express";
// import { isAdmin, isLogin } from "../middleware/authCheck.js";
import {getAllCategories, getCategoryById } from "../controller/categories.controller.js";
import multer from "multer";

const upload = multer();


const router = express.Router();

// read all
router.get("/all", getAllCategories);
// read by id
router.get("/:cid", getCategoryById);


export default router;