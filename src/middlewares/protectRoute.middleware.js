const { promisify } = require("util");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const protectRoute = asyncHandler(async (req, res, next) => {
  console.log("protectRoute middleware hit...");
  // Steps:
  // 1. get token from request
  // 2. verify token
  // 3. see if user still exists
  // 4. if user changed password after token was issued

  //   console.log("req.headers:", req.headers);
  let token;
  if (
    req.headers?.authorization &&
    req.headers?.authorization.startsWith("Bearer")
  ) {
    token = req.headers?.authorization.split(" ")[1];
    // console.log("token:", token);
  }

  if (!token) {
    throw new AppError(
      "You are not logged in! Please log in to get access.",
      401
    );
  }

  //   const decodedToken = await promisify(jwt.verify)(
  //     token,
  //     process.env.JWT_ACCESS_TOKEN_SECRET
  //   );
  //   console.log("decodedToken:", decodedToken);
  // if the client sends wrong token, a jsonwebtoken error will be generated; we can handle it more explicitly in global error handler: DO LATER.

  //   if the jwt has expired, this is different from malformed jwt, above case, we can also handle this case explicitly in global error handler: DO LATER.

  //For now I've used try-catch to handle the errors here, but better to handle in global error handler.
  let decodedToken;
  try {
    decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET
    );
  } catch (error) {
    // console.log("error.message:", error.message);
    throw new AppError(error?.message || "Invalid token", 401);
  }

  //   What if user was deleted after the token was issued.
  const currentUser = await UserModel.findById(decodedToken.id);
  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token does no longer exist.",
      401
    );
  }

  //   What if user changed password after the token was issued.
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    throw new AppError(
      "User recently changed password! Please log in again.",
      401
    );
  }

  req.user = currentUser;
  next();
});

module.exports = protectRoute;
