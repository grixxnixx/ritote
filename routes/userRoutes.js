const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.patch("/updateMe", authController.protect, authController.updateMe);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updateMyPassword
);

router.post("/fotgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:resetToken", authController.resetPassword);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    userController.deleteUser
  );

module.exports = router;
