const asyncHandler = (fn) => {
  return async (req, res, next) => {
    // Note: when using the 'asyncHandler' function, we must always pass the next() function so that the error can be further passed on to the error handler.
    try {
      return await fn(req, res, next);
    } catch (error) {
      console.log("Error caught in async handler:", error);
      next(error);
    }
  };
};

module.exports = asyncHandler;
