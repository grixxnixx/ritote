const factory = require("./handleFactory");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// exports.getAllReviews = factory.getAll(Review);

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.id) filter = { product: req.params.id };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.getReview = factory.getOne(Review);
// exports.updateReview = factory.updateOne(Review);
exports.createReview = factory.createOne(Review, true);

exports.deleteReview = catchAsync(async (req, res, next) => {
  const deleteReview = await Review.findByIdAndDelete(req.params.id);
  await Review.calcAverageRatings(deleteReview.product);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const doc = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await Review.calcAverageRatings(doc.product);

  res.status(200).json({
    status: "success",
    message: "Data update successfully",
    data: {
      doc,
    },
  });
});
