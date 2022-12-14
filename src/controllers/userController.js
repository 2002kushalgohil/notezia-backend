const GlobalPromise = require("../middlewares/globalPromise");
const User = require("../models/userModel");
const https = require("https");
const { customResponse } = require("../utils/responses");
const emailSender = require("../utils/emailSender");
const jwt = require("jsonwebtoken");

exports.signup = GlobalPromise(async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!(email && password && name)) {
      return customResponse(res, 400, "Please fill all the details");
    }

    if (await User.findOne({ email })) {
      return customResponse(res, 400, "User already registered");
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

    customResponse(res, 201, "Registration successful", data);
  } catch (error) {
    return customResponse(res, 400, "!Opps something went wrong");
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
      return customResponse(res, 400, "Please register first");
    }

    const isPassCorrect = await user.isValidPassword(password);
    if (!isPassCorrect) {
      return customResponse(res, 400, "Invalid credentials");
    }

    const accessToken = user.generateJWT();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const data = { accessToken, refreshToken };

    customResponse(res, 200, "Login Successful", data);
  } catch (error) {
    console.log(error);
    return customResponse(res, 400, "!Opps something went wrong");
  }
});

exports.googleAuth = GlobalPromise(async (req, res) => {
  try {
    let googleAuthToken = req.query.googleAuthToken;
    if (!googleAuthToken) {
      return customResponse(res, 400, "Please fill all the details");
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
        return customResponse(res, 400, "Invalid Token");
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
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        const data = { accessToken, refreshToken };

        return customResponse(res, 201, "Registration successful", data);
      }

      const accessToken = user.generateJWT();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save();

      const data = { accessToken, refreshToken };

      customResponse(res, 200, "Login Successful", data);
    };
  } catch (error) {
    return customResponse(res, 400, "!Opps something went wrong");
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
      return customResponse(res, 400, "Please register first");
    }

    // -------------------- Generate forgot password token --------------------
    const forgotToken = user.getForgotPasswordToken();
    await user.save({ validateBeforeSave: false });
    const url = `https://notezia.kushalgohil.com/resetpassword?token=${forgotToken}`;

    const message = `
        <p>Trouble signing in?</p>
        <p>Resetting your password is easy.</p>
        <p>
          Just click on the link below and follow the instructions. We’ll have
          you up and running in no time.
        </p>
        <a href=${url}>${url}</a>
        <p>If you did not make this request then please ignore this email.</p>`;

    // -------------------- Sending a email with token --------------------
    try {
      await emailSender({
        email: user.email,
        subject: "Here's how to reset your password",
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
    return customResponse(res, 400, "!Opps something went wrong");
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
    // await user.save();
    const accessToken = user.generateJWT();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    const data = { accessToken, refreshToken, user };

    customResponse(res, 200, "Password has been reset successfully", data);
  } catch (error) {
    return customResponse(res, 400, "!Opps something went wrong");
  }
});

exports.userProfile = GlobalPromise(async (req, res) => {
  try {
    req.user.forgotPasswordToken = undefined;
    req.user.forgotPasswordExpiry = undefined;
    req.user.createdAt = undefined;
    customResponse(res, 200, "User profile", req.user);
  } catch (error) {
    return customResponse(res, 400, "!Opps something went wrong");
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
    return customResponse(res, 400, "!Opps something went wrong");
  }
});

exports.refreshToken = GlobalPromise(async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return customResponse(res, 400, "Please fill all the details");
    }

    const isTokenValid = jwt.verify(
      refreshToken,
      process.env.REFRESHTOKEN_SECRET
    );

    const user = await User.findOne({ id: isTokenValid.id, refreshToken });

    if (!user) {
      return customResponse(res, 400, "Invalid token");
    }

    const accessToken = user.generateJWT();
    const newRefreshToken = user.generateRefreshToken();
    const data = { accessToken, refreshToken: newRefreshToken, user };

    user.refreshToken = newRefreshToken;
    await user.save();

    customResponse(res, 200, "New Token generated", data);
  } catch (error) {
    console.log(error);
    return customResponse(res, 400, "Refresh Token expired");
  }
});
