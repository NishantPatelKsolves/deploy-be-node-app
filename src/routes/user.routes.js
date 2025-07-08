const express = require("express");
const { getAllUsers } = require("../controllers/users.controller");
const userRouter = express.Router();

userRouter.get(`/`, getAllUsers);

module.exports = userRouter;
