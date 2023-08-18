const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const {
  login,
  signup,
  forgotPassword,
  passwordReset,
  googleAuth,
  userProfile,
  updateProfile,
  refreshToken,
} = require("../controllers/userController");

// ------------------------ Auth Routes ------------------------
router.post("/signup", signup);
router.post("/login", login);
router.get("/googleAuth", googleAuth);
router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:token", passwordReset);
router.get("/refreshtoken", refreshToken);

// ------------------------ User Routes ------------------------
router.get("/", isLoggedIn, userProfile);
router.patch("/", isLoggedIn, updateProfile);

module.exports = router;
