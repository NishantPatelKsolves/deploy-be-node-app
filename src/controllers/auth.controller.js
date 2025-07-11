const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const signUp = asyncHandler(async (req, res, next) => {
//   console.log("req.body", req.body);
  const userData = req.body;
  const userExist = await UserModel.findOne({ email: userData?.email });

  if (userExist) {
    throw new AppError("A user with this email already exist.", 400);
  }

  const user = await UserModel.create(userData);
  if (!user) {
    throw new AppError("Error adding user", 500);
  }

  const addedUser = await UserModel.findById(user?._id).select(
    "-password -confirm_password -isDeleted -__v -createdAt -updatedAt"
  );
  if (!addedUser) {
    throw new AppError("Error fetching added user", 500);
  }

  // Once user has signed up: send jwt to user to user to indicate they've also logged in successfully.
  const token = generateJWTToken({
    id: addedUser._id,
    email: addedUser.email,
  });

  res.status(201).json({
    status: "success",
    message: "Signup successful",
    data: addedUser,
    token,
  });
});

const generateJWTToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

const login = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    message: "Login successful",
  });
});

module.exports = {
  login,
  signUp,
};
