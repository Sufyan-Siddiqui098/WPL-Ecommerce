import express from "express";
import {
  getUserByIdController,
  loginController,
  signupController,
  updateUserController,
  updateUserPassword,
} from "../controller/user.controller.js";
import {
  validateFields,
  validateLogin,
} from "../middleware/validateUserField.js";
import { isAdmin, isLogin } from "../middleware/authCheck.js";

const router = express.Router();

// validate required fields.
router.post("/signup", validateFields, signupController);
router.post("/login", validateLogin, loginController);
// validate required fields (not password)
router.put("/update-user", isLogin, validateFields, updateUserController);
router.get("/user/:userId", isLogin, getUserByIdController);
// update password
router.put("/update-password", isLogin, updateUserPassword);

export default router;
