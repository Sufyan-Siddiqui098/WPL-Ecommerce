import express from "express";
import { getUserByIdController, loginController, signupController, updateUserController } from "../controller/user.controller.js";
import { validateFields, validateLogin } from "../middleware/validateUserField.js";
import { isLogin } from "../middleware/authCheck.js";


const router = express.Router();

// validate required fields. 
router.post("/signup", validateFields,signupController);
router.post("/login", validateLogin, loginController);
// validate required fields (not password) 
// Email shouldn't be change (TO DO)
router.put("/update-user", isLogin, validateFields, updateUserController )
router.get("/user/:userId", isLogin, getUserByIdController )


export default router;