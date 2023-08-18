const GlobalPromise = require("../middlewares/globalPromise");
const User = require("../models/userModel");
const https = require("https");
const { response } = require("../utils/responses");
const emailSender = require("../utils/emailSender");
const jwt = require("jsonwebtoken");
const { resetPassword } = require("../utils/emailTemplates");

exports.signup = GlobalPromise(async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!(email && password && name)) {
      return response(res, 400, "Please provide all required details");
    }

    if (await User.findOne({ email })) {
      return response(res, 400, "User already registered");
    }

    // -------------------- Setting default profile picture --------------------
    req.body.photos = {
      id: "NA",
      secure_url:
        "https://res.cloudinary.com/dryviglqd/image/upload/v1670610093/users/avataaars_odsvbg.png",
    };

    const user = await User.create(req.body);
    const accessToken = user.generateJWT();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    const data = { accessToken, refreshToken };

    return response(res, 201, "Registration successful", data);
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.login = GlobalPromise(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return response(res, 400, "Please provide all required details");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return response(res, 400, "Please register first");
    }

    const isPassCorrect = await user.isValidPassword(password);
    if (!isPassCorrect) {
      return response(res, 400, "Invalid credentials");
    }

    const accessToken = user.generateJWT();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    const data = { accessToken, refreshToken };

    response(res, 200, "Login Successful", data);
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.googleAuth = GlobalPromise(async (req, res) => {
  try {
    let googleAuthToken = req.query.googleAuthToken;
    if (!googleAuthToken) {
      return response(res, 400, "Please provide all required details");
    }

    // -------------------- Getting user data from access token --------------------
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
            handleGoogleLogin(error);
          }
        });
      }
    );

    const handleGoogleLogin = async (userData) => {
      if (!userData?.email) {
        return response(res, 400, "Invalid Token");
      }

      const user = await User.findOne({ email: userData.email });

      // -------------------- If not registered then register the user --------------------
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

        // -------------------- Send the user access token --------------------
        const accessToken = newUser.generateJWT();
        const refreshToken = newUser.generateRefreshToken();

        newUser.refreshToken = refreshToken;
        await newUser.save();

        const data = { accessToken, refreshToken };

        return response(res, 201, "Registration successful", data);
      }

      const accessToken = user.generateJWT();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      const data = { accessToken, refreshToken };

      response(res, 200, "Login Successful", data);
    };
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.forgotPassword = GlobalPromise(async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return response(res, 400, "Please provide all required details");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response(res, 400, "Please register first");
    }

    // -------------------- Generate forgot password token --------------------
    const forgotToken = user.getForgotPasswordToken();
    await user.save({ validateBeforeSave: false });
    const url = `https://notezia.kushalgohil.com/resetpassword?token=${forgotToken}`;

    const message = resetPassword(url);

    // -------------------- Sending a email with forgot password token --------------------
    try {
      await emailSender({
        email: user.email,
        subject: "Notezia: Here's how to reset your password",
        message,
      });
      response(res, 200, "Please check your email to reset your password");
    } catch (error) {
      user.forgotPasswordExpiry = undefined;
      user.forgotPasswordToken = undefined;
      user.save({ validateBeforeSave: true });
      return response(res, 400, "Oops! Something went wrong");
    }
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.passwordReset = GlobalPromise(async (req, res) => {
  try {
    const paramToken = req.params.token;
    const { password, confirmpassword } = req.body;

    // -------------------- Finding a user  --------------------
    const user = await User.findOne({
      forgotPasswordToken: paramToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return response(res, 400, "Token Expired");
    }

    if (!(password && confirmpassword)) {
      return response(res, 400, "Please provide all required details");
    }

    if (password !== confirmpassword) {
      return response(res, 400, "Passwords does not match");
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    const accessToken = user.generateJWT();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    const data = { accessToken, refreshToken, user };

    response(res, 200, "Password has been reset successfully", data);
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.userProfile = GlobalPromise(async (req, res) => {
  try {
    req.user.forgotPasswordToken = undefined;
    req.user.forgotPasswordExpiry = undefined;
    req.user.createdAt = undefined;
    req.user.refreshToken = undefined;
    response(res, 200, "User profile", req.user);
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.updateProfile = GlobalPromise(async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      returnDocument: "after",
    });

    response(res, 200, "Profile updated successfull", user);
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});

exports.refreshToken = GlobalPromise(async (req, res) => {
  try {
    let refreshToken = req.query.refreshToken;

    if (!refreshToken) {
      return response(res, 400, "Please provide a refresh token");
    }

    try {
      const isTokenValid = jwt.verify(
        refreshToken,
        process.env.REFRESHTOKEN_SECRET
      );

      const user = await User.findOne({ _id: isTokenValid.id, refreshToken });

      if (!user) {
        return response(res, 400, "Invalid refresh token");
      }
      const accessToken = user.generateJWT();
      const newRefreshToken = user.generateRefreshToken();
      const data = { accessToken, refreshToken: newRefreshToken };
      user.refreshToken = newRefreshToken;
      await user.save();

      response(res, 200, "New Token generated", data);
    } catch (error) {
      return response(res, 400, "Refresh token expired or invalid");
    }
  } catch (error) {
    return response(
      res,
      400,
      "An error occurred while processing your request"
    );
  }
});
