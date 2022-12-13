const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const {
  login,
  signup,
  forgotPassword,
  passwordReset,
  updateProfilePhoto,
  updateName,
  googleAuth,
  userProfile,
  updateProfile,
} = require("../controllers/userController");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/googleAuth").get(googleAuth);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").post(passwordReset);
router.route("/").get(isLoggedIn, userProfile);
router.route("/").patch(isLoggedIn, updateProfile);

module.exports = router;
