const GlobalPromise = require("../middlewares/globalPromise");
const User = require("../models/userModel");
const cloudinary = require("cloudinary");
const {
  EmptyFieldRes,
  UserExistRes,
  UserDoesNotExistRes,
  InvalidCredRes,
  SomethingWentWrong,
  PasswordDoesNotMatch,
  TokenExpired,
} = require("../utils/responses");
const mailHelper = require("../utils/emailHelper");

exports.signup = GlobalPromise(async (req, res) => {
  const { email, password, name } = req.body;

  if (!(email && password && name && req.files)) {
    return EmptyFieldRes(res);
  }

  if (await User.findOne({ email })) {
    return UserExistRes(res);
  }

  const response = await cloudinary.v2.uploader.upload(
    req.files.photo.tempFilePath,
    {
      folder: "users",
      width: 150,
      crop: "scale",
    }
  );
  req.body.photo = { id: response.public_id, secure_url: response.secure_url };

  const user = await User.create(req.body);
  const token = user.generateJWT();
  user.password = undefined;

  res.status(201).json({
    status: 201,
    success: true,
    token,
    user,
  });
});

exports.login = GlobalPromise(async (req, res) => {
  const { email, password } = req.body;

  if (!(email && password)) {
    return EmptyFieldRes(res);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return UserDoesNotExistRes(res);
  }

  const isPassCorrect = await user.isValidPassword(password);

  if (!isPassCorrect) {
    return InvalidCredRes(res);
  }

  const token = user.generateJWT();
  user.password = undefined;

  res.status(201).json({
    status: 201,
    success: true,
    token,
    user,
  });
});

exports.forgotPassword = GlobalPromise(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: 400,
      success: false,
      message: "Please fill all the information",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return UserDoesNotExistRes(res);
  }

  const forgotToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.get(
    "host"
  )}/resetpassword/${forgotToken}`;

  const message = `Copy paste this link in your URL and hit enter \n \n ${url}`;

  try {
    await mailHelper({
      email: user.email,
      subject: "Password reset email",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    user.save({ validateBeforeSave: true });
    return SomethingWentWrong(res);
  }
});

exports.passwordReset = GlobalPromise(async (req, res) => {
  const token = req.params.token;

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return TokenExpired(res);
  }

  if (!(req.body.password && req.body.confirmpassword)) {
    return EmptyFieldRes(res);
  }

  if (req.body.password !== req.body.confirmpassword) {
    return PasswordDoesNotMatch(res);
  }

  user.password = req.body.password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  const jwtToken = user.generateJWT();

  res.status(200).json({
    success: true,
    jwtToken,
    user,
  });
});

exports.updateProfilePhoto = GlobalPromise(async (req, res) => {
  if (!req.files) {
    return EmptyFieldRes(res);
  }

  const user = await User.findById(req.user.id);
  const imageId = user.photo.id;

  await cloudinary.v2.uploader.destroy(imageId);

  const result = await cloudinary.v2.uploader.upload(
    req.files.photo.tempFilePath,
    {
      folder: "users",
      width: 150,
      crop: "scale",
    }
  );

  user.photo = {
    id: result.public_id,
    secure_url: result.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});
