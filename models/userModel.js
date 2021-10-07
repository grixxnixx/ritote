const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/appError");

const userSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  name: {
    type: String,
    required: [true, "a user must have a name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "user must have a email"],
    lowercase: true,
    validate: [validator.isEmail, "Please use valid email address!"],
  },
  photo: {
    type: String,
  },
  bio: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user",
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    minlength: 8,
    validate: {
      validator: function (pass) {
        return this.password === pass;
      },
      message: "Passwords are not same",
    },
    select: false,
  },
  passwordResetToken: String,
  resetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now() - 5000;
  next();
});

// userSchema.static.
userSchema.methods.correctPassword = async function (
  candidatePassword,
  currectPassword
) {
  return await bcrypt.compare(candidatePassword, currectPassword);
};

userSchema.methods.passwordChangeAfter = function (jwtTimeStams) {
  if (this.passwordChangedAt) {
    const changeTimeStams = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return jwtTimeStams < changeTimeStams;
  }
  return false;
};

userSchema.methods.genarateRandomBytes = function () {
  const randomToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  this.resetTokenExpires = Date.now() + 10 * 60 * 1000;

  console.log({ randomToken }, this.passwordResetToken);
  return randomToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
