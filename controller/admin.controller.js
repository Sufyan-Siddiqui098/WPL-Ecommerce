import { createHashPassword } from "../helper/authHelper.js";
import Categories from "../model/categories.model.js";
import Product from "../model/product.model.js";
import User from "../model/User.model.js";

// ------------------------------- Categories -------------------------------s
// Create
export const adminCreateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const existingCategory = await Categories.findOne({ name });
    if (existingCategory) {
      return res.status(409).send({
        success: false,
        message: "Category already exist",
      });
    }
    // if no photo
    if (!req.file) {
      return res.status(400).json({ message: "Photo is required" });
    }

    // create document
    const category = await Categories.create({
      name: name,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await category.save();

    res.status(200).send({
      success: true,
      message: "Category created successfully !",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while creating category",
      error,
    });
  }
};
// Update (by Admin)
export const adminUpdateCategoryById = async (req, res) => {
  try {
    const { name } = req.body;
    const { cid } = req.params;

    // Check if category exists
    const category = await Categories.findById(cid);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    //   Check duplicate name (only if updating name)
    if (name && name !== category.name) {
      const duplicate = await Categories.findOne({ name });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category name already exists",
        });
      }
      category.name = name;
    }

    //  Update photo if provided
    if (req.file) {
      category.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    // Update
    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while updating category",
      error,
    });
  }
};

// Delete (By Admin)
export const adminDeleteCategoryById = async (req, res) => {
  try {
    const { cid } = req.params;

    const category = await Categories.findById(cid);
    if (!category) {
      return res.status(409).send({
        success: false,
        message: "Category not found",
      });
    }

    await Categories.findByIdAndDelete(cid);

    return res.status(200).json({
      success: true,
      message: `Category ${category.name} deleted successfully`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while deleting category",
      error,
    });
  }
};

// ------------------------------- USER  -------------------------------
// Update Password (By Admin)
export const adminUpdateUserPasswordById = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;
    const { userId } = req.params;

    // Validation
    if (!newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required [new-password, confirm-password]",
      });
    }
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required in url parameter.",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password must match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // If user exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash the password.
    user.password = await createHashPassword(newPassword);
    await user.save();

    res.status(200).json({
      success: true,
      message: "User password updated successfully by admin",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Something went while updating password (By Admin) wrong",
      error,
    });
  }
};

// Admin updates any user info & role
export const adminUpdateUserInfoControllerById = async (req, res) => {
  try {
    const { firstName, lastName, phone, role, email } = req.body;
    const { userId } = req.params; // user to be updated

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // duplicate phone if changing
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already registered",
        });
      }
    }
    if(email && email !== user.email){
      const existingUserWithEmail = await User.findOne({ email });
      if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered",
        });
      }
    }
    

    //  Update only provided fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if(role) user.role = role.trim().toUpperCase();
    if(email) user.email = email;

    const updatedUser = (await user.save()).toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      message: "User updated successfully by admin!",
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
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while updating user",
      error,
    });
  }
};
// Admin Delete User 
export const adminDeleteUserControllerById = async (req, res) => {
  try {
    const { userId } = req.params; // user to be updated

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: `User ${user.firstName} deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while deleting user",
      error,
    });
  }
};
// Admin Get All User
export const adminGetAllUsersController = async (req, res) => {
  try {
    const users = await User.find({});
    if(!users || users.length < 1){
      return res.status(400).send({
        success: false,
        message: "No user found",
      });
    }

    const filteredUser = users.map((user)=> {
      return {
        _id: user._id, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      };
    })

    res.status(200).send({
      success: true,
      message: "Users fetched successfully !",
      users: [...filteredUser],
    });
  } catch (error) {
     res.status(500).json({
      success: false,
      message: error.message || "Something went wrong while fetching users",
      error,
    });
  }
}

// ------------------------------- PRODUCT  -------------------------------
// Admin Delete Product
export const adminDeleteProductController = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    await Product.findByIdAndDelete(pid);

    res.status(200).send({
      success: true,
      message: `Product ${product.name} deleted successfully by admin`,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while deleting product",
      error,
    });
  }
};