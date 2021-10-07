const Product = require("../models/shopingModel");
const AppError = require("./appError");

class AppFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    let queryStr = JSON.stringify(this.queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    const queryParse = JSON.parse(queryStr);
    this.query = this.query.find(queryParse);

    return this;
  }

  sorting() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryObj.fields) {
      const fieldsBy = this.queryObj.fields.split(",").join(" ");
      this.query = this.query.select(fieldsBy);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }

  paginate() {
    const limit = +this.queryObj.limit || 10;
    const page = +this.queryObj.page || 1;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }

  search() {
    if (this.queryObj.name) {
      this.query = this.query.find({
        title: { $regex: this.queryObj.name, $options: "i" },
      });
    }
    return this;
  }
}

module.exports = AppFeatures;
