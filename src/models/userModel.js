const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    validate: [validator.isEmail, "Please enter an appropriate email"],
    unique: true,
  },

  password: {
    type: String,
    required: [true, "Please provide an Password"],
    select: false,
  },

  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxLength: [40, "Name should be under 40 characters"],
  },

  photos: {
    id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },

  cards: [
    {
      type: mongoose.Schema.ObjectId,
    },
  ],

  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,
  refreshToken: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// -------------------- Password hashing before creating and forgetting password --------------------
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// -------------------- Validate password --------------------
userSchema.methods.isValidPassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

// -------------------- JWT token generation --------------------
userSchema.methods.generateJWT = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// -------------------- Refresh token generation --------------------
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESHTOKEN_SECRET, {
    expiresIn: process.env.REFRESHTOKEN_EXPIRY,
  });
};

// -------------------- Forgot password token generation --------------------
userSchema.methods.getForgotPasswordToken = function () {
  const forgotToken = crypto.randomBytes(20).toString("hex");
  this.forgotPasswordToken = forgotToken;
  this.forgotPasswordExpiry = new Date(Date.now() + 20 * 60 * 1000);

  return forgotToken;
};

module.exports = mongoose.model("User", userSchema);
