const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUserById,
} = require("../controllers/users.controller");
const { paramValidation, updateUserValidation } = require("../middlewares");
const userRouter = express.Router();

userRouter.get(`/`, getAllUsers);
userRouter.get(`/:id`, paramValidation, getUserById);
userRouter.patch("/:id", paramValidation, updateUserValidation, updateUserById);

module.exports = userRouter;