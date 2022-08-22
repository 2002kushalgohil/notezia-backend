const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const {
  login,
  signup,
  forgotPassword,
  passwordReset,
  updateProfilePhoto,
} = require("../controllers/userController");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/updatephoto").patch(isLoggedIn, updateProfilePhoto);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:token").post(passwordReset);

module.exports = router;
