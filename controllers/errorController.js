const AppError = require("./../utils/AppError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  // (psk ey error ndirouh using AppError rah ykoun isOperational)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unknown errors
    // (hna chghol error yessra w mech 7na li dernah ya3ni isOperational rah tkoun false)
  } else {
    // LOG error
    console.error(err);
    // Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const globalErrorHandling = (err, req, res, next) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV == "development") {
    // console.log(err.code);
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == "production") {
    if (err.name === "CastError") {
      err.message = "Invalid ID";
      err.statusCode = 404;
      err.isOperational = true;
    }
    if (err.name === "JsonWebTokenError") {
      err.message = "Invalid Token. Please login again";
      err.statusCode = 401;
      err.isOperational = true;
    }
    if (err.message === "jwt expired") {
      err.message = "Token is Expired";
      err.statusCode = 401;
      err.isOperational = true;
    }
    sendErrorProd(err, res);
  }
};

module.exports = globalErrorHandling;
