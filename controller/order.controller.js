import Order from "../model/order.model.js";
import Cart from "../model/cart.model.js";
import Product from "../model/product.model.js";

// Create order 
export const createOrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: "Shipping address is required" });
    }

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name price seller availableStock",
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // group items by seller
    const sellerGroups = {};
    for (const item of cart.items) {
      const product = item.product;
      if (!product) continue;

      const sellerId = product.seller.toString();
      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = [];
      }
      sellerGroups[sellerId].push({
        product: product._id,
        quantity: item.quantity,
        price: item.priceAtAddition,
      });
    }

    // Separate order for each seller
    const orders = [];
    for (const [sellerId, items] of Object.entries(sellerGroups)) {
      const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const order = await Order.create({
        buyer: userId,
        seller: sellerId,
        items,
        totalAmount,
        shippingAddress,
        paymentMethod: "cash_on_delivery",
      });
      orders.push(order);

    }

    // clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orders,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Error creating order" });
  }
};

// Get orders 
export const getUserOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("seller", "firstName lastName")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Get orders for seller
export const getSellerOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("buyer", "firstName lastName email phone")
      .populate("items.product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get seller orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Update order status (seller only)
export const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["accepted", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // only seller can update
    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // cant update if already processed
    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Order already processed" });
    }

    // if cancelling, restore stock
    if (status === "cancelled") {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { availableStock: item.quantity },  // increase product item by item.quantity
        });
      }
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: `Order ${status}`, order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Error updating order" });
  }
};

// Get single order by id
export const getOrderByIdController = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("buyer", "firstName lastName email phone")
      .populate("seller", "firstName lastName")
      .populate("items.product", "name");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // check if user is buyer or seller
    const userId = req.user._id.toString();
    if (order.buyer._id.toString() !== userId && order.seller._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};
