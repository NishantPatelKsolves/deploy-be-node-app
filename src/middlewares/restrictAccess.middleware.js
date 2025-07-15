const AppError = require("../utils/appError");

/**
 * Middleware to restrict access based on user role
 * usually we can't pass arguments to a middleware function
 * so we use a wrapper function to return a middleware function.
 */
const restrictAccess = (...roles) => {
  // roles is an array
  // In protectRoute middleware, we've already stored the role of current user in user object, req.user=currentUser
  return (req, res, next) => {
    if (!roles.includes(req?.user?.role)) {
    //   console.log("Reached to restrictAccess middleware");
      throw new AppError(
        "You do not have permission to perform this action",
        403 // forbidden
      );
    }
    next();
  };
};

module.exports = restrictAccess;
