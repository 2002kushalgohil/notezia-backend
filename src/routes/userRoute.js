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

// -------------------- User Routes --------------------
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/googleAuth").get(googleAuth);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").post(passwordReset);
router.route("/refreshtoken").post(refreshToken);
router.route("/").get(isLoggedIn, userProfile);
router.route("/").patch(isLoggedIn, updateProfile);

module.exports = router;
