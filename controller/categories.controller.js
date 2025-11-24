import Categories from "../model/categories.model.js";

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
        message: "No Category found",
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
