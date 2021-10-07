const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

router.use("/:id/reviews", reviewRouter);

router.get(
  "/top-5-cheapProduct",
  productController.top5cheapProducts,
  productController.getAllProducts
);

router.get("/getStats", productController.getProductsStats);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    productController.deleteProduct
  );

// router.post(
//   "/:id/reviews",
//   authController.protect,
//   reviewController.createReview
// );

module.exports = router;
