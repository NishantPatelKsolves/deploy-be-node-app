const express = require("express");
const tourRouter = require("./tours.routes.js");
const userRouter = require("./user.routes.js");
const authRouter = require("./auth.routes.js");
const router = express.Router();

router.use("/tours", tourRouter);
router.use("/users", userRouter);
router.use("/auth", authRouter);

module.exports = router;
