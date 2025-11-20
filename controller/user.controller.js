import { comparePassword, createHashPassword } from "../helper/authHelper.js";
import User from "../model/User.model.js";
import jwt from "jsonwebtoken";

// Create User
export const signupController = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      let errorMessage = "";

      if (existingUser.email === email)
        errorMessage = "Email is already registered";
      else if (existingUser.phone === phone)
        errorMessage = "Phone number is already registered";

      return res.status(409).send({
        success: false,
        message: errorMessage,
      });
    }

    const hashedPassword = await createHashPassword(password);
    const createUserPayload = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
    };

    if (role === "SELLER") {
      createUserPayload.role = role;
    }
    const registeredUser = (await User.create(createUserPayload)).toObject();

    res.status(200).send({
      success: true,
      message: "Signup successfully !",
      user: {
        _id: registeredUser._id,
        firstName: registeredUser.firstName,
        lastName: registeredUser.lastName,
        email: registeredUser.email,
        phone: registeredUser.phone,
        role: registeredUser.role,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while signup",
      error,
    });
  }
};

// Login User
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    const validPassword = await comparePassword(password, user.password);

    if (!validPassword) {
      return res.status(400).send({
        success: false,
        message: "Invalid Credentials",
      });
    }

    //Token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).send({
      success: true,
      message: "Login Successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while login",
      error,
    });
  }
};

// Update user
export const updateUserController = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user._id);

    // if user is not present.
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    // If phone and phone number is change
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone });
      // If new phoen is already registereted with another user.
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already registered",
        });
      }
    }

    // updating - already validated fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;

    const updatedUser = (await user.save()).toObject();
    delete updatedUser.password;

    res.status(200).send({
      success: true,
      message: "User updated successfully !",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while updating user",
      error,
    });
  }
};

// Update Password
export const updateUserPassword = async (req, res) => {
  try {
    const { password, newPassword, confirmNewPassword } = req.body;

    const user = await User.findById(req.user._id);

    // if user is not present.
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }
    // compare the hash password and password.
    if (!(await comparePassword(password, user.password))) {
      return res.status(400).send({
        success: false,
        message: "Invalid user passowrd!",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).send({
        success: false,
        message: "New password & confirm password should be same!",
      });
    }

    user.password = await createHashPassword(newPassword);

    await user.save();

    res.status(200).send({
      success: true,
      message: "Password changed successfully !",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while changing password",
      error,
    });
  }
};

// Get user by Id
export const getUserByIdController = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).send({
      success: false,
      message: "User not found ",
    });
  }

  if (
    req.user.role !== "ADMIN" &&
    user._id.toString() !== req.user._id.toString()
  ) {
    return res.status(409).send({
      success: false,
      message: "You're not authorized",
    });
  }

  res.status(200).send({
    success: true,
    message: "User fetched Successfully",
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};
