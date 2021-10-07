const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handleFactory");
const User = require("../models/userModel");

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.createUser = factory.createOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = catchAsync(async (req, res, next) => {
  if (!req.params.id) req.params.id = req.user.id;
  next();
});
