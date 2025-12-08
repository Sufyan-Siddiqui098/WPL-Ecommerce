import jwt from "jsonwebtoken";

//Authentication token check.
export const isLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is missing or malformed.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode; // send the user in req -- it has the {_id, initialzed at , expire at } properties with values.
    next();
  } catch (err) {
    res.status(400).send(err);
  }
};

// Admin access

export const isAdmin = async (req, res, next) => {
  try {
    // const user = await userModel.findById(req.user._id)
    if (req.user.role !== "ADMIN") {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "error in amdin middleware",
      error: err,
    });
  }
};

// Seller access
export const isSeller = async (req, res, next) => {
  try {
    if (req.user.role !== "SELLER") {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access - Seller only",
      });
    } else {
      next();
    }
  } catch (err) {
    res.status(400).send({
      success: false,
      message: "Error in seller middleware",
      error: err,
    });
  }
};

