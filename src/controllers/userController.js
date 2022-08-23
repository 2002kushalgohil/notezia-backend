const GlobalPromise = require("../middlewares/globalPromise");
const User = require("../models/userModel");

const { customResponse } = require("../utils/responses");
const emailSender = require("../utils/emailSender");
const { imageUploader, imageDestroyer } = require("../utils/imageHelper");

exports.signup = GlobalPromise(async (req, res) => {
  const { email, password, name } = req.body;

  if (!(email && password && name)) {
    return customResponse(res, 400, "Please fill all the details");
  }

  if (await User.findOne({ email })) {
    return customResponse(res, 400, "User already registered");
  }

  if (req.files) {
    const response = await imageUploader(req, {
      folder: "users",
      width: 150,
      crop: "scale",
    });

    req.body.photos = {
      id: response[0].id,
      secure_url: response[0].secure_url,
    };
  }

  const user = await User.create(req.body);
  const token = user.generateJWT();
  user.password = undefined;

  const data = { token, user };
  customResponse(res, 201, "User Registered successfully", data);
});

exports.login = GlobalPromise(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return customResponse(res, 400, "Please fill all the details");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return customResponse(res, 404, "No user found");
  }

  const isPassCorrect = await user.isValidPassword(password);
  if (!isPassCorrect) {
    return customResponse(res, 400, "Invalid credentials");
  }

  const token = user.generateJWT();
  user.password = undefined;
  const data = { token, user };

  customResponse(res, 200, "Login Successful", data);
});

exports.forgotPassword = GlobalPromise(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return customResponse(res, 400, "Please fill all the details");
  }

  const user = await User.findOne({ email });
  if (!user) {
    return customResponse(res, 404, "No user found");
  }

  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });
  const url = `${req.protocol}://${req.get(
    "host"
  )}/resetpassword/${forgotToken}`;
  const message = `Copy paste this link in your URL and hit enter \n \n ${url}`;

  try {
    await emailSender({
      email: user.email,
      subject: "Password reset email",
      message,
    });
    customResponse(res, 200, "Please check your email to reset your password");
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    user.save({ validateBeforeSave: true });
    return customResponse(res, 400, "Oops! Something went wrong");
  }
});

exports.passwordReset = GlobalPromise(async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return customResponse(res, 400, "Token Expired");
  }

  if (!(req.body.password && req.body.confirmpassword)) {
    return customResponse(res, 400, "Please fill all the details");
  }

  if (req.body.password !== req.body.confirmpassword) {
    return customResponse(res, 400, "Passwords does not match");
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  const jwtToken = user.generateJWT();
  const data = { jwtToken, user };

  customResponse(res, 200, "Password has been reset successfully", data);
});

exports.updateProfilePhoto = GlobalPromise(async (req, res) => {
  if (!req.files) {
    return customResponse(res, 400, "Please fill all the details");
  }

  const user = await User.findById(req.user.id);

  imageDestroyer(user.photos.id);

  const response = await imageUploader(req, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  user.photos = {
    id: response[0].id,
    secure_url: response[0].secure_url,
  };

  await user.save();

  customResponse(res, 200, "Profile photo updated successfull", user);
});
