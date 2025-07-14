const UserModel = require("../models/user.model");
const APIFeatures = require("../utils/apiFeatures");
const asyncHandler = require("../utils/asyncHandler");

const getAllUsers = asyncHandler(async (req, res, next) => {
  //   const users = await UserModel.find();

  const features = new APIFeatures(UserModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.mongooseQuery.exec();

  res.status(200).json({
    status: "success",
    results: users?.length,
    data: {
      users,
    },
  });
});

const getUserById = asyncHandler(async (req, res, next) => {
  const id = req.params?.id;
  const user = await UserModel.findById(id);

  if (!user) {
    return next(new AppError(`No user found with id: ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

const updateUserById = asyncHandler(async (req, res, next) => {
  const id = req.params?.id;
  const user = await UserModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError(`No user found with id: ${id}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

module.exports = { getAllUsers, getUserById, updateUserById };
