const Review = require("./../models/reviewModel");
const factory = require("./handlerFactory.js");
const asyncHandler = require("express-async-handler");

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.id;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
exports.getAllReviews = asyncHandler(async (req, res, next) => {
  let filter = {};
  if (req.params.tourID) filter = { tour: req.params.tourID };
  const reviews = await Review.find(filter);
  res
    .status(200)
    .json({ status: "success", results: reviews.length, data: { reviews } });
});
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
