const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const router = express.Router();

router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router
  .route("/updateMyPassword")
  .patch(authController.protect, authController.updatePassword);
router
  .route("/updateMe")
  .patch(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserphoto,
    userController.updateMe
  );
router
  .route("/deleteMe")
  .delete(authController.protect, userController.deleteMe);
router
  .route("/me")
  .get(authController.protect, userController.getMe, userController.getUser);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
