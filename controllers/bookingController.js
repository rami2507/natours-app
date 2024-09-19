const Tour = require("./../models/tourModel");
const asyncHandler = require("express-async-handler");
const stripe = require("stripe")("jdkfmalekfvjekwdelfkejfkwnekje");

exports.getCheckoutSession = asyncHandler(async (req, res, next) => {
  // GET THE CURRENTLY BOOKED TOUR
  const tour = await Tour.findById(req.params.tourID);

  // CREATE SESSION
  const session = await stripe.checkout.sessions.create({
    payment_method_type: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: "usd",
        quantity: 1,
      },
    ],
  });

  // CREATE SESSION AS RESPONSE
  res.status(200).json({
    status: "success",
    session,
  });
});
