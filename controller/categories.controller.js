import Categories from "../model/categories.model.js";

// --- Create
export const createCategoryController = async (req, res) => {
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

// ----- Read
export const getCategoryById = async (req, res) => {
  try {
    const { cid } = req.params;
    const category = await Categories.findById(cid);

    if (!category) {
      return res.status(409).send({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Category fetched successfully !",
      category,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching category",
      error,
    });
  }
};

// Read All
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.find({});

    if (!categories || categories?.length < 1) {
      return res.status(400).send({
        success: false,
        message: "Categories not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Categories fetched successfully !",
      categories,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching categories",
      error,
    });
  }
};

// Update (by Admin)
export const updateCategoryById = async (req, res) => {
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
export const deleteCategoryById = async (req, res) => {
  try {
    const {cid} = req.params;

    const category = await Categories.findById(cid);
    if(!category){
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
}
