const express = require("express");
const tourRouter = require("./tours.routes.js");
const userRouter = require("./user.routes.js");
const authRouter = require("./auth.routes.js");
const { protectRoute } = require("../middlewares/index.js");
const router = express.Router();

router.use("/tours", protectRoute, tourRouter);
router.use("/users", protectRoute, userRouter);
router.use("/auth", authRouter);

module.exports = router;
