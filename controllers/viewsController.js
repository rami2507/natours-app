const Tour = require("./../models/tourModel");
const catchAsync = require("./../utils/catchAsync");
exports.getOverview = catchAsync(async (req, res, next) => {
  // GET TOUR DATA
  const tours = await Tour.find();
  // BUILD TEMPLATE IN (OVERVIEW.PUG)
  // RENDER THAT TEMPLATE USING TOUR DATA
  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug });
  res.status(200).render("tour", { title: tour.name, tour }); // Render the "tour" view and pass the tour data
});

exports.getLogin = (req, res) => {
  res.status(200).render("login", {
    title: "Login to your account",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
};
