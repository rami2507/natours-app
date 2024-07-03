const express = require("express");
const router = express.Router();
const tourController = require("./../controllers/tourController");
const reviewRouter = require("./../routes/reviewRoutes");
const authController = require("./../controllers/authController");

router.use("/:tourID/reviews", reviewRouter);

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.createTour
  )
  .get(tourController.getAllTours);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.uploadTourImages,
    tourController.resizeTourimages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    tourController.deleteTour
  );

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);

router.route("/distances/:latlang/unit/:unit").get(tourController.getDistances);

module.exports = router;
