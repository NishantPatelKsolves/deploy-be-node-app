const UserModel = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { generateJWTToken } = require("../utils/jwt");

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

const login = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  //   console.log("userData", userData);
  const user = await UserModel.findOne({ email: userData?.email }).select(
    "+password"
  );

  if (
    !user ||
    !(await user.comparePassword(userData?.password, user.password))
  ) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateJWTToken({
    id: user?._id,
    email: user?.email,
  });

  res.status(200).json({
    status: "success",
    message: "Login successful",
    // data: user, // does not matter when login, if still sending this user to client, hde password field.
    token,
  });
});

module.exports = {
  login,
  signUp,
};
