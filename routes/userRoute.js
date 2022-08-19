const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  forgotPassword,
  passwordReset,
  updateProfilePhoto,
} = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/isLoggedIn");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").post(passwordReset);
router.route("/updateAccountinfo").post(isLoggedIn, updateProfilePhoto);

module.exports = router;
