const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const AppFeatures = require("../utils/appFeatures");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new AppFeatures(Model.find(), req.query)
      .filter()
      .sorting()
      .limitFields()
      .paginate()
      .search();

    const doc = await features.query;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.getOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new AppError("No documenet with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      message: "Data update successfully",
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model, setOp) =>
  catchAsync(async (req, res, next) => {
    if (setOp) {
      if (!req.body.product) req.body.product = req.params.id;
      if (!req.body.user) req.body.user = req.user.id;
    }

    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  });
