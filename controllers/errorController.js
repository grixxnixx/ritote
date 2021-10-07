const AppError = require("../utils/appError");

const handlerErrorDB = (err) => {
  // new AppError(`Can't find any product with that id`, 404);
  const message = `Invalid path ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const handleMongoServerError = (err) => {
  const message = `Duplicate value: ${err.keyValue.title}, Please try another one`;

  return new AppError(message, 400);
};

const handleValidatorError = (err) => {
  console.log(err._message);
  const message = `${err._message}! value: ${err.errors.value} path: ${err.errors.path}`;
  return new AppError(message, 400);
};

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(`ERROR 💥`, err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  // Send Error for Development
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(res, err);

    // Send error for Production
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.name = err.name;

    if (error.name === "CastError") error = handlerErrorDB(error);
    if (error.code === 11000) error = handleMongoServerError(error);
    if (error.name === "ValidationError") error = handleValidatorError(error);
    sendErrorProd(error, res);
  }
};
