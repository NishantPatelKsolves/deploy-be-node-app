const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please fill up your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email."],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
    },
    confirm_password: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This validator only runs on 'save' and 'create' operations in mongoose, so whenever we've to update the user we must call 'save' and not findOneAndUpdate.
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same.",
      },
    },
    photo: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// using mongoose pre save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return; // this is same as // return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.confirm_password = undefined;
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
