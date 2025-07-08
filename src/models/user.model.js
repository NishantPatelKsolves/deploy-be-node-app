const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
