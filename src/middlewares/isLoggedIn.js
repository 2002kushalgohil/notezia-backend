const { response } = require("../utils/responses");
const GlobalPromise = require("./globalPromise");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// -------------------- Validate token --------------------
exports.isLoggedIn = GlobalPromise(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  try {
    if (!token) {
      return response(res, 403, "Invalid token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return response(res, 403, "Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    return response(res, 403, "Token expired");
  }
});
