const { response } = require("../utils/responses");
const GlobalPromise = require("./globalPromise");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// ---------------------- JWT Token Validation ----------------------
exports.isLoggedIn = GlobalPromise(async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return response(res, 401, "Authentication required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return response(res, 401, "Invalid user");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return response(res, 401, "Token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      return response(res, 401, "Invalid token");
    }
    return response(res, 500, "Internal server error");
  }
});
