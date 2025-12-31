import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import categoryRoute from "./routes/category.route.js";
import adminRoute from "./routes/admin.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";
import mongoose from "mongoose";

// Environment Variable Configured.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoute);
// Admin specific
app.use("/api/admin", adminRoute);

app.listen(PORT, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`connected to MongoDb`);
    console.log(
      `Server is running on port ${PORT} in ${
        process.env.NODE_ENV || "development"
      } mode`
    );
  } catch (err) {
    console.log(`Error in Mongodb ${err}`);
  }
});
