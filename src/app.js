const express = require("express");
const morgan = require("morgan");
const responseTime = require("response-time");
const qs = require("qs");
const compression = require("compression");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const globalErrorHandler = require("./controllers/error.controller.js");
const { API, VERSION } = require("./constants.js");
const router = require("./routes/index.js");
const AppError = require("./utils/appError.js");
const app = express();
app.use(express.json({ limit: "10kb" }));
// express.json() reads the Content-Type: application/json header in the incoming request and parses the JSON data into a JavaScript object, which is then accessible via req.body.
// limit option implements limiting the amount of data that can be sent to the server, hence prevent attacker to sent huge data.
// bodies larger than 10kb will not be accepted.
app.use(express.urlencoded({ extended: true }));
// This middleware parses URL-encoded bodies and makes the data available as a JavaScript object in req.body.
// If you don’t use express.json() and/or urlencoded(), req.body will be undefined for JSON/Form data requests.

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(
  responseTime()
  //     {
  //     digits: 2,
  //     header: "Custom-Header-X-Response-Time",
  //     suffix: false,
  //   } // options object which is completely optional.
); //a middleware that adds a X-Response-Time header to responses. https://expressjs.com/en/resources/middleware/response-time.html
app.use(compression()); // Returns the compression middleware using the given options. The middleware will attempt to compress response bodies for all requests that traverse through the middleware, based on the given options.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again after 15 mins!", // Response to return after limit is reached.
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
app.use(limiter); // Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset. Prevents DOS and brute-force attacks.
app.use(helmet()); // Helmet is an npm package that helps secure Express/Connect apps with various HTTP headers. Helmet is a wrapper around 15 middleware functions that set security-related HTTP headers, such as Content-Security-Policy, X-Frame-Options, X-XSS-Protection, and more. https://dev.to/sid__/why-do-you-need-helmet-in-nodejs-h1b

// Override Express's default query parser
app.set("query parser", (queryString) => {
  return qs.parse(queryString, {
    allowDots: true, // Allows `duration.gte=5` syntax
    depth: 10, // Allows nested objects up to 10 levels deep
    parseArrays: false, // Disables array parsing (if not needed)
    comma: false, // Disables comma parsing (if not needed)
  });
});

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

const apiAndVersion = `${API}${VERSION}`;
app.use(apiAndVersion, router);

// Creating this route to test the PM2 integration, and automatic server restart when uncaughtException occurs: REMOVE IT FOR PRODUCTION APPLICATIONS
app.get("/create-uncaughtException-route", (req, res) => {
  setTimeout(() => {
    console.log(x); // x is undefined → ReferenceError -> uncaughtException
  }, 100);
  // console.log(x);
  res.send("create-uncaughtException-route hit...");
});

// Handling unhandled routes
app.all("*name", (req, res, next) => {
  // https://expressjs.com/en/guide/migrating-5.html#path-syntax
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // // M1: below code to test error handling middleware.
  // const err = new Error("Not Found");
  // err.status = "fail";
  // err.statusCode = 404;
  // // err.message = `Can't find ${req.originalUrl} on this server!`;
  // next(err); // anything passed to next, next considers it as error.

  // M2: Handling error through appError class
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
