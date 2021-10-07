const mongoose = require("mongoose");

mongoose
  .connect(`mongodb://localhost:27017/shoping`)
  .then(() => console.log("Database connect successfully"));

const User = require("../models/userModel");
const Review = require("../models/reviewModel");
// const Product = require("../models/productModel");

const deleteData = async () => {
  try {
    await Review.deleteMany();
    // await Product.deleteMany();
    console.log("Data deleted");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--delete") {
  deleteData();
}
