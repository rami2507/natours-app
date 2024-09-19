// Import required modules and files
const express = require("express");
const path = require("path");
const globalErrorHandling = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const dotenv = require("dotenv");
const server = require("./server");

// Create an Express application
const app = express();

// PUG ENGINE
app.set("view engine", "pug"); // SETTING THE ENGINE TO PUG
app.set("views", path.join(__dirname, "/views")); // PATH TO OUR VIEWS

// SERVE STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// PATH TO ENV VARS
dotenv.config({ path: "./.env" });

// 1) WE BASICALLY START WITH SECURITY MIDDLEWARES FIRST
// A) Set security HTTP Headers
app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        connectSrc: ["'self'", "https://js.stripe.com"],
      },
    },
  })
);

// B) Data Sanitization against XSS
app.use(xss());

// C) Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// D) Apply rate limiting middleware
const limiter = rateLimit({
  max: 10, // Maximum number of requests
  window: 60 * 60 * 1000, // Time window in milliseconds (1 hour)
  message:
    "You have reached the maximum of tries from the same IP, try again later", // Message for exceeding limit
});

app.use("/api", limiter);

// 2) Middleware to parse incoming JSON requests
app.use(express.json());
app.use(cookieParser());

// 3) ROUTING
// A) Import route handlers
const tourRoutes = require("./routes/tourRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const viewsRoutes = require("./routes/viewsRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// COMPRESS TEXT RESPONSES
app.use(compression());

// B) ROUTES
app.use("/", viewsRoutes);

app.use("/api/v2/tours", tourRoutes); // Mount tour routes
app.use("/api/v2/users", userRoutes); // Mount user routes
app.use("/api/v2/reviews", reviewRoutes); // Mount review routes
app.use("/api/v2/bookings", bookingRoutes); // Mount booking routes

// C) Catch-all route handler for paths that don't match any route
app.all("*", function (req, res, next) {
  next(new AppError("This path is not found", 404)); // Create and pass a 404 error to the next middleware
});

// 4) Global error handling middleware
// A) Error handling middleware to catch and handle all errors
app.use(globalErrorHandling);

// ERRORS OUT PF EXPRESS-JS
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection Error: ${err}`);
  server.close(() => {
    console.error("Shutting Down");
    process.exit(1);
  });
});

// 5) Export the configured Express application
module.exports = app;
