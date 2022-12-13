const GlobalPromise = require("../middlewares/globalPromise");
const User = require("../models/userModel");
const https = require("https");
const { customResponse } = require("../utils/responses");
const emailSender = require("../utils/emailSender");

exports.signup = GlobalPromise(async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!(email && password && name)) {
      return customResponse(res, 400, "Please fill all the details");
    }

    if (await User.findOne({ email })) {
      return customResponse(res, 400, "User already registered");
    }

    req.body.photos = {
      id: "NA",
      secure_url:
        "https://res.cloudinary.com/dryviglqd/image/upload/v1670610093/users/avataaars_odsvbg.png",
    };

    const user = await User.create(req.body);
    const token = user.generateJWT();
    user.password = undefined;

    const data = { token, user };
    customResponse(res, 201, "Registration successful", data);
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.login = GlobalPromise(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return customResponse(res, 400, "Please fill all the details");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return customResponse(res, 404, "Please register first");
    }

    const isPassCorrect = await user.isValidPassword(password);
    if (!isPassCorrect) {
      return customResponse(res, 400, "Invalid credentials");
    }

    const token = user.generateJWT();
    user.password = undefined;
    const data = { token, user };

    customResponse(res, 200, "Login Successful", data);
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.googleAuth = GlobalPromise(async (req, res) => {
  try {
    let googleAuthToken = req.query.googleAuthToken;
    if (!googleAuthToken) {
      return customResponse(res, 400, "Please fill all the details");
    }

    https.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleAuthToken}`,
      (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            handleGoogleLogin(JSON.parse(data));
          } catch (error) {
            console.error(error);
            handleGoogleLogin(error);
          }
        });
      }
    );

    const handleGoogleLogin = async (userData) => {
      if (!userData?.email) {
        return customResponse(res, 400, "Invalid Token");
      }

      const user = await User.findOne({ email: userData.email });

      if (!user) {
        const newUser = await User.create({
          email: userData.email,
          password: process.env.JWT_SECRET,
          name: userData.name,
          photos: {
            id: "NA",
            secure_url: userData.picture,
          },
        });
        const token = newUser.generateJWT();
        newUser.password = undefined;
        const data = { token, newUser };
        return customResponse(res, 201, "Registration successful", data);
      }

      const token = user.generateJWT();
      user.password = undefined;
      const data = { token, user };

      customResponse(res, 200, "Login Successful", data);
    };
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.forgotPassword = GlobalPromise(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return customResponse(res, 400, "Please fill all the details");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return customResponse(res, 404, "Please register first");
    }

    const forgotToken = user.getForgotPasswordToken();
    await user.save({ validateBeforeSave: false });
    const url = `${req.protocol}://${req.get(
      "host"
    )}/resetpassword?token=${forgotToken}`;
    const message = `Copy paste this link in your URL and hit enter \n \n ${url}`;

    try {
      await emailSender({
        email: user.email,
        subject: "Password reset email",
        message,
      });
      customResponse(
        res,
        200,
        "Please check your email to reset your password"
      );
    } catch (error) {
      user.forgotPasswordExpiry = undefined;
      user.forgotPasswordToken = undefined;
      user.save({ validateBeforeSave: true });
      return customResponse(res, 400, "Oops! Something went wrong");
    }
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.passwordReset = GlobalPromise(async (req, res) => {
  try {
    const token = req.params.token;
    const { password, confirmpassword } = req.body;

    const user = await User.findOne({
      forgotPasswordToken: token,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return customResponse(res, 400, "Token Expired");
    }

    if (!(password && confirmpassword)) {
      return customResponse(res, 400, "Please fill all the details");
    }

    if (password !== confirmpassword) {
      return customResponse(res, 400, "Passwords does not match");
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save();
    const jwtToken = user.generateJWT();
    const data = { jwtToken, user };

    customResponse(res, 200, "Password has been reset successfully", data);
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.userProfile = GlobalPromise(async (req, res) => {
  try {
    req.user.forgotPasswordToken = undefined;
    req.user.forgotPasswordExpiry = undefined;
    req.user.createdAt = undefined;
    customResponse(res, 200, "User profile", req.user);
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.updateProfilePhoto = GlobalPromise(async (req, res) => {
  try {
    const { photos, name } = req.body;

    const user = await User.findById(req.user.id);
    user.photos = photos;
    user.name = name;
    await user.save();

    customResponse(res, 200, "Profile updated successfull", user);
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});

exports.updateProfile = GlobalPromise(async (req, res) => {
  try {
    const { photos, name } = req.body;

    const user = await User.findById(req.user.id);
    user.name = name;
    user.photos = photos;
    await user.save();

    customResponse(res, 200, "Profile updated successfull", user);
  } catch (error) {
    return customResponse(res, 400, "Opps! Something went wrong");
  }
});
