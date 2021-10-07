const mongoose = require("mongoose");
const Product = require("./shopingModel");

const reviewSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  review: {
    type: String,
    required: [true, "A review should not be empty"],
  },
  rating: {
    type: Number,
    min: [1, "rating shount below 1"],
    max: [5, "rating must be below 5.0"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A review must belong a user"],
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "A review must belong a product"],
  },
});

// reviewSchema.pre(/^findOne/, function (next) {
//   this.populate("user", "name").populate("product", "title price");

//   next();
// });

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        numRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].numRating,
  });
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatings(this.product);
});

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function () {
//   // await this.findOne(); does NOT work here, query has already executed
//   const model = this.r.constructor;
//   await model.calcAverageRatings(this.r.tour);
// });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
