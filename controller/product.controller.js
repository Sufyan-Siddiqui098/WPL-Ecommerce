import Product from "../model/product.model.js";
import Categories from "../model/categories.model.js";

// Create Product (Seller only)
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, availableStock } = req.body;

    // Check if category exists
    const existingCategory = await Categories.findById(category);
    if (!existingCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Check if photo is provided
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Photo is required",
      });
    }

    
    const product = await Product.create({
      name,
      description,
      price,
      category,
      photo: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
      seller: req.user._id,
      availableStock
    });

    res.status(201).send({
      success: true,
      message: "Product created successfully!",
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        seller: product.seller,
        availableStock: product.availableStock,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while creating product",
      error,
    });
  }
};

// Update Product (Seller only - own products)
export const updateProductController = async (req, res) => {
  try {
    const { pid } = req.params;
    const { name, description, price, category, availableStock } = req.body;

    // Check if product exists
    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to update this product",
      });
    }

    // If category is being updated, check if it exists
    if (category && category !== product.category.toString()) {
      const existingCategory = await Categories.findById(category);
      if (!existingCategory) {
        return res.status(404).send({
          success: false,
          message: "Category not found",
        });
      }
      product.category = category;
    }

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if(availableStock) product.availableStock = availableStock;

    // Update photo
    if (req.file) {
      product.photo = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await product.save();

    res.status(200).send({
      success: true,
      message: "Product updated successfully!",
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        seller: product.seller,
        availableStock: product.availableStock,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while updating product",
      error,
    });
  }
};

// Delete Product (Seller only - own products)
export const deleteProductController = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to delete this product",
      });
    }

    await Product.findByIdAndDelete(pid);

    res.status(200).send({
      success: true,
      message: `Product ${product.name} deleted successfully`,
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

// Get Seller's Own Products
export const getSellerProductsController = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id })
      .select("-photo")
      .populate("category", "name")
      .populate("seller", "firstName lastName email");

    if (!products || products.length < 1) {
      return res.status(400).send({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Products fetched successfully!",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching seller products",
      error,
    });
  }
};

// Get All Products
export const getAllProductsController = async (req, res) => {
  try {
    const products = await Product.find({})
      .select("-photo")
      .populate("category", "name")
      .populate("seller", "firstName lastName email")
      .sort({ createdAt: -1 });

    if (!products || products.length < 1) {
      return res.status(400).send({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Products fetched successfully!",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching products",
      error,
    });
  }
};

// Get Single Product by ID
export const getProductByIdController = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findById(pid)
      .select("-photo")
      .populate("category", "name")
      .populate("seller", "firstName lastName email");

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Product fetched successfully!",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching product",
      error,
    });
  }
};

// Get Product Photo
export const getProductPhotoController = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findById(pid).select("photo");

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.photo || !product.photo.data) {
      return res.status(404).send({
        success: false,
        message: "Product photo not found",
      });
    }

    res.set("Content-Type", product.photo.contentType);
    return res.status(200).send(product.photo.data);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching product photo",
      error,
    });
  }
};

// Get Products by Category
export const getProductsByCategoryController = async (req, res) => {
  try {
    const { cid } = req.params;

    // Check if category exists
    const category = await Categories.findById(cid);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    const products = await Product.find({ category: cid })
      .select("-photo")
      .populate("category", "name")
      .populate("seller", "firstName lastName email");

    if (!products || products.length < 1) {
      return res.status(400).send({
        success: false,
        message: "No products found in this category",
      });
    }

    res.status(200).send({
      success: true,
      message: "Products fetched successfully!",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message
        ? error.message
        : "Something went wrong while fetching products by category",
      error,
    });
  }
};


