const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Product = require("../models/shopingModel");

exports.productRender = catchAsync(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).render("product", {
    title: "All Products",
    products,
  });
});
