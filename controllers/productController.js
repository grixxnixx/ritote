const Product = require("../models/shopingModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const AppFeatures = require("../utils/appFeatures");

const factory = require("./handleFactory");

// exports.getAllProducts = factory.getAll(Product);
exports.getProduct = factory.getOne(Product);
exports.updateProduct = factory.updateOne(Product);
exports.createProduct = factory.createOne(Product);
exports.deleteProduct = factory.deleteOne(Product);

exports.top5cheapProducts = catchAsync(async (req, res, next) => {
  if (!req.query.sort) req.query.sort = "-ratingsAverage,price";
  if (!req.query.limit) req.query.limit = 5;
  next();
});

exports.getProductsStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 2 } },
    },
    {
      $group: {
        _id: null,
        numProducts: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        avgRatings: { $avg: "$ratingsAverage" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  let queryObj = req.query;

  if (queryObj.name) {
    queryObj = {
      title: { $regex: req.query.name, $options: "i" },
    };
  }

  const products = await Product.find(queryObj);

  res.status(200).json({
    status: "success",
    restults: products.length,
    data: {
      products,
    },
  });
});
