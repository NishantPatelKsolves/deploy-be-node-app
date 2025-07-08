const mongoose = require("mongoose");

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function run() {
  const uri = process.env.MONGODB_URI;
  // try {
  // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
  await mongoose.connect(uri, clientOptions);
  await mongoose.connection.db.admin().command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  // } catch (error) {
  //   console.error("Unable to connect to the MongoDB Atlas cluster", error);
  // }
  // commenting try catch here to pass error to catch in wrapper promise handler and handle promise rejection there
}

module.exports = run;
