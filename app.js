const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");
const Product = require("./models/shopingModel");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const productRouter = require("./routes/productRoutes");
const viewRouter = require("./routes/viewRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");

const app = express();

dotenv.config({ path: "./config.env" });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Serve static file
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(morgan("dev"));
app.use(express.json());

app.use((req, res, next) => {
  // console.log(req.headers);
  req.requestAt = Date.now();
  next();
});

app.use("/", viewRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(`Can't find any route ${req.originalUrl} on this server`, 404)
  );
});

app.use(globalErrorHandler);

module.exports = app;
