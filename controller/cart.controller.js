import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

// Get user's cart
export const getCartController = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name description price availableStock seller category",
      populate: [
        { path: "seller", select: "firstName lastName email" },
        { path: "category", select: "name" },
      ],
    });

    if (!cart) {
      return res.status(200).send({
        success: true,
        message: "Cart is empty",
        cart: { items: [], totalItems: 0, totalPrice: 0 },
      });
    }

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.priceAtAddition * item.quantity,
      0
    );

    res.status(200).send({
      success: true,
      message: "Cart fetched successfully",
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Error fetching cart",
      error,
    });
  }
};

// Add item to cart
export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate quantity
    if (quantity < 1) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check if enough stock is available
    if (product.availableStock < quantity) {
      return res.status(400).send({
        success: false,
        message: `Only ${product.availableStock} items available in stock`,
      });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product already in cart, update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].priceAtAddition = product.price;
    } else {
      // Add new product to cart
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: product.price,
      });
    }

    // Decrease product stock
    product.availableStock -= quantity;
    await product.save();

    // Save cart
    await cart.save();

    // Populate cart items for response
    await cart.populate({
      path: "items.product",
      select: "name description price availableStock",
    });

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.priceAtAddition * item.quantity,
      0
    );

    res.status(200).send({
      success: true,
      message: "Product added to cart successfully",
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Error adding to cart",
      error,
    });
  }
};

// Remove item from cart
export const removeFromCartController = async (req, res) => {
  try {
    const { productId } = req.params;
    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart",
      });
    }

    const cartItem = cart.items[itemIndex];

    // Find the product to restore stock
    const product = await Product.findById(productId);

    if (!product) {
      // Product was deleted, remove from cart
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).send({
        success: true,
        message: "Product removed from cart (product no longer exists)",
      });
    }

    let quantityToRestore;

      // Remove entire item
    quantityToRestore = cartItem.quantity;
    cart.items.splice(itemIndex, 1);
    

    // Restore product stock
    product.availableStock += quantityToRestore;
    await product.save();

    // Save cart
    await cart.save();

    // Populate cart items for response
    await cart.populate({
      path: "items.product",
      select: "name description price availableStock",
    });

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.priceAtAddition * item.quantity,
      0
    );

    res.status(200).send({
      success: true,
      message: "Product removed from cart successfully",
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Error removing from cart",
      error,
    });
  }
};

// Clear entire cart
export const clearCartController = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(200).send({
        success: true,
        message: "Cart is already empty",
      });
    }

    // Restore stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.availableStock += item.quantity;
        await product.save();
      }
    }

    // Clear cart items
    cart.items = [];
    await cart.save();

    res.status(200).send({
      success: true,
      message: "Cart cleared successfully",
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Error clearing cart",
      error,
    });
  }
};

// Update item quantity in cart
export const updateCartItemController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).send({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).send({
        success: false,
        message: "Product not found in cart",
      });
    }

    const cartItem = cart.items[itemIndex];
    const currentQuantity = cartItem.quantity;

    // Find the product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product no longer exists",
      });
    }

    // Calculate the difference
    const quantityDifference = quantity - currentQuantity;

    // Check if we need to add more (reduce stock)
    if (quantityDifference > 0) {
      if (product.availableStock < quantityDifference) {
        return res.status(400).send({
          success: false,
          message: `Only ${product.availableStock} additional items available`,
        });
      }
      product.availableStock -= quantityDifference;
    } else if (quantityDifference < 0) {
      // We're reducing quantity - convert neg number to positive to restore
      product.availableStock += Math.abs(quantityDifference);
    }

    // Update cart item quantity
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].priceAtAddition = product.price;

    await product.save();
    await cart.save();

    // Populate cart items for response
    await cart.populate({
      path: "items.product",
      select: "name description price availableStock",
    });

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (sum, item) => sum + item.priceAtAddition * item.quantity,
      0
    );

    res.status(200).send({
      success: true,
      message: "Cart updated successfully",
      cart: {
        _id: cart._id,
        items: cart.items,
        totalItems,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "Error updating cart",
      error,
    });
  }
};
