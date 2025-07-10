const app = require("./app");
const dotenv = require("dotenv");
const run = require("./database");
const { connectRedis } = require("./database/redisClient");
/**
 * Nodejs uncaught exception handling
 * https://stackoverflow.com/questions/50202507/nodejs-uncaught-exception-handling
 * Al errors that occur in our synchronous code but are not handled anywhere in our application are called uncaught exceptions.
 */
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  // USE ERROR LOGGING LIBRARIES HERE, IF REQUIRED
  console.log("Shutting down...");
  // gracefully close the server and exit the application
  process.exit(1);
  // this is not ideal, in real world we must use tools/libraries to re-start our application whenever it crashes.
});
// console.log(x)

dotenv.config();

const port = process.env.PORT || 3000;
let server;

// M1: one way of connecting to database and redis and then only listen to server
// run()
//   .then(() => {
//     // redisClient();
//     server = app.listen(port, () => {
//       console.log(`Listening on http://localhost:${port}`);
//     });
//   })
//   .catch((error) => {
//     console.error("Unable to connect to the MongoDB Atlas cluster", error);
//   });

// M2: other way of connecting to database and redis and then only listen to server
async function bootstrap() {
  try {
    await run(); // connect to MongoDB
    await connectRedis(); // connect to Redis

    server = app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server due to connection error:", error);
    process.exit(1);
  }
}

bootstrap();

/**
 * What is an unhandled promise rejection?
 * https://stackoverflow.com/questions/40500490/what-is-an-unhandled-promise-rejection
 * An unhandled promise rejection is an error that occurs when a promise is rejected and not handled by any catch block.
 * We will now implement global error handler to handle unhandled promise rejections somewhere in our application.
 * Whenever there is unhandled promise rejection somewhere in our application, the process object will emit and event called 'unhandledRejection' event.
 */
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  // USE ERROR LOGGING LIBRARIES HERE IF REQUIRED
  console.log("Shutting down...");
  // gracefully close the server and exit the application
  server?.close(() => {
    process.exit(1);
  });
  // this is not ideal, in real world we must use tools/libraries to re-start our application whenever it crashes.
});

/**
 * Graceful shutdown
When you deploy a new version of your application, you must replace the previous version. The process manager you’re using will first send a SIGTERM signal to the application to notify it that it will be killed. Once the application gets this signal, it should stop accepting new requests, finish all the ongoing requests, clean up the resources it used, including database connections and file locks then exit.
 */

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
