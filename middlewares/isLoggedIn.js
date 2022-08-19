const { UnAuthorised } = require("../utils/responses");
const GlobalPromise = require("./globalPromise");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.isLoggedIn = GlobalPromise(async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return UnAuthorised(res);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id);
  next();
});
