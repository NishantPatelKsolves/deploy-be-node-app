const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

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
      select: false,
    },
    confirm_password: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This validator only runs on 'save' and 'create' operations in mongoose, so whenever we've to update the user we must call 'save' and not findOneAndUpdate.
        validator: function (el) {
          console.log("password from model:", this.password);
          return el === this.password;
        },
        message: "Passwords are not the same.",
      },
      select: false,
    },
    photo: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false, select: false },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "guide", "lead-guide", "admin"],
      default: "user",
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
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

// instance methods for mongoose model instances
userSchema.methods.comparePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// instance methods for mongoose model instances
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // if the user is created for first time the passwordChangedAt will be null, that why default return is 'false'.
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = async function () {
  // Why create a reset token?
  // This token acts as a temporary password that the user can use to create a new real password. And of course only the user will have access to this token.Hence it acts as a password.
  // But if a hacker gets access to this token, they can easily change users password, so instead to storing this token as a plain string in the database, we store it as a hash.
  // But unlike 'password', 'reset-password' does not require a very strong cryptographically strong hashing technique that we use bcrypt, we can use built-in crypto module's createHash method to create a hash.
  // As a security measure we're implementing passwordResetExpires field in DB, which will track if the reset-token is still valid or not.
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  // console.log({
  //   resetToken,
  //   passwordResetExpires: this.passwordResetExpires,
  //   passwordResetToken: this.passwordResetToken,
  // });
  return resetToken; // plain text token we'll send to user through email.
  // We'll send unencrypted token to the user otherwise it'll make no sense to encrypt the token at all, so if the token in DB is same as the token the user has, it's no security.
};

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  // exist this middleware if password is not modified or if the document is new.
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// remove inactive users from the query result
userSchema.pre(/^find/, function (next) {
  // "this" points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
