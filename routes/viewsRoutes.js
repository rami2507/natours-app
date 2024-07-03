const express = require("express");
const viewsController = require("./../controllers/viewsController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.route("/").get(authController.isLoggedIn, viewsController.getOverview);
router.get("/tour/:slug", authController.isLoggedIn, viewsController.getTour);
router.route("/login").get(authController.isLoggedIn, viewsController.getLogin);
router.route("/me").get(authController.protect, viewsController.getAccount);

module.exports = router;
