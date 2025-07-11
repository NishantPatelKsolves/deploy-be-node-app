const express = require("express");
const { login, signUp } = require("../controllers/auth.controller");
const { validateUserSignup } = require("../middlewares");
const authRouter = express.Router();

// un-protected
authRouter.post(`/sign-up`, validateUserSignup, signUp);
// protected:
authRouter.post(`/login`, login);
authRouter.post(`/sign-out`, login);
authRouter.post(`/forget-password`, login);
authRouter.post(`/reset-password`, login);

module.exports = authRouter;
