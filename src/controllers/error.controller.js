// since the handler functions are stored as controllers hence this error handler is stored here in along with the other controllers.
module.exports = (err, req, res, next) => {
//   console.error(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  //   Sending different error message for development and production environments.
  //   In prod we must leak as little info as possible to the end user.
  if (process.env.NODE_ENV === "development") {
    // res.status(err.statusCode).json({
    //   status: err.status,
    //   message: err.message,
    //   stack: err.stack,
    //   error: err,
    // });
    // making code more modular
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // res.status(err.statusCode).json({
    //   status: err.status,
    //   message: err.message,
    // });
    // making code more modular
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorForProd = (err, res) => {
  // all errors created by us are operational errors, these are the errors that we control, but there can be other errors that are not created by us, these are unexceptional errors, hence we need to differentiate between the errors.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Unexpected error, don't leak details
    // Steps:
    // 1: log error: USE ERROR LOGGING LIBRARIES later
    console.error("UNEXPECTED ERROR IN PROD💥", err);
    // 2: send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};
