class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    // all errors created with this class will be operational errors, we'll now use this class to create all the errors in our application.
    // We're doing this so that later we can then test for this property and only send the error messages back to the client for these operational errors that we created using this class, this is useful because there will be some unexceptional errors related to packages/libraries that don't have this isOperational property on them. Hence we can differentiate between the errors.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

// Right now there are errors coming from mongoose which are not marked as operational errors.Hence they will be treated as unexceptional errors in production and a general/vague response will be sent. We handle it here so to snd a useful message to client.
// There are 3 types of error that might be created by mongoose and we need to mark them as operational errors so that we send meaningful messages to the client.
// 1. Invalid Id
// 2. Duplicate key(name/email/phone/etc) error
// 3. Validation error
// We have not implemented it in our app, do it if the need arises.
