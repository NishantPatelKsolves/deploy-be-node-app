const express = require("express");
const {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  updatePassword,
  deleteAccount,
} = require("../controllers/auth.controller");
const {
  validateUserSignup,
  validateUserLogin,
  protectRoute,
} = require("../middlewares");
const authRouter = express.Router();

// un-protected
authRouter.post(`/sign-up`, validateUserSignup, signUp);
// protected:
authRouter.post(`/login`, validateUserLogin, login);
authRouter.post(`/sign-out`, login);
authRouter.post(`/forgot-password`, forgotPassword);
authRouter.patch(`/reset-password/:token`, resetPassword); // 'patch' because it modifies the password of user in DB.

// give functionality to user to update their 'password', without the forget-reset password cycle. A logged in user should be able to update their password.
authRouter.patch(`/update-password`, protectRoute, updatePassword);
authRouter.delete(`/delete-account`, protectRoute, deleteAccount);

module.exports = authRouter;
