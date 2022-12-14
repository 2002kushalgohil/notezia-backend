const { customResponse } = require("../utils/responses");
const GlobalPromise = require("./globalPromise");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// -------------------- Validate token --------------------
exports.isLoggedIn = GlobalPromise(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return customResponse(res, 404, "Invalid token");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);

  if (!user) {
    return customResponse(res, 404, "Invalid token");
  }

  req.user = user;
  next();
});
