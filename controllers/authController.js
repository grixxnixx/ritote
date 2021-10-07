const { promisify } = require("util");
const crypto = require("crypto");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const sendToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const sendReponse = (res, user) => {
  const token = sendToken(user.id);

  return res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  sendReponse(res, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  // Check password and username exists
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find document based on password and username
  const user = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  // Check password is valid
  // Check password and username correct or not!
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("password and email is incorrect", 400));
  }

  // Send response to the client
  sendReponse(res, user);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // set header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Check token exists
  if (!token) {
    return next(new AppError("Login to your account", 404));
  }

  // verify existing token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("user is not exist", 404));
  }

  if (currentUser.passwordChangeAfter(decoded.iat)) {
    return next(
      new AppError("Password is recently changed. Please log in again", 401)
    );
  }

  req.user = currentUser;
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "Passwords are update is not here you have to go /updateMyPassword route",
        400
      )
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
      bio: req.body.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError("Your current password is not correct", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  sendReponse(res, user);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `You don't have any permission to action this perform`,
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("Please provide your email address", 404));
  }

  // Genarate random token
  const resetToken = user.genarateRandomBytes();
  await user.save({ validateBeforeSave: false });
  // Send email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password! ? Submit PATCH request to set a new password and passwordConfirm to: ${resetUrl}\n if you did't forgot your password then feel free to ignore it`;

  await sendEmail({
    to: user.email,
    subject: "Forgot your password token(Only valid for 10 min)",
    text: message,
  });
  // Send response

  res.status(200).json({
    status: "success",
    message: "Token sent successfully",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Find user based on resetToken
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });
  // Send Error is there is no token
  if (!user) {
    return next(new AppError("Your token is invalid or expired", 400));
  }
  // Set And Save passwords
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
