const crypto = require("crypto");
const { API, VERSION } = require("../constants");
const UserModel = require("../models/user.model");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const sendEmailNodeMailer = require("../utils/emailServices/nodemailer");
const { generateJWTToken } = require("../utils/jwt");

const signUp = asyncHandler(async (req, res, next) => {
  //   console.log("req.body", req.body);
  const userData = req.body;
  const userExist = await UserModel.findOne({ email: userData?.email });

  if (userExist) {
    throw new AppError("A user with this email already exist.", 400);
  }

  const user = await UserModel.create(userData);
  if (!user) {
    throw new AppError("Error adding user", 500);
  }

  const addedUser = await UserModel.findById(user?._id).select(
    "-password -confirm_password -isDeleted -__v -createdAt -updatedAt"
  );
  if (!addedUser) {
    throw new AppError("Error fetching added user", 500);
  }

  // Once user has signed up: send jwt to user to user to indicate they've also logged in successfully.
  const token = generateJWTToken({
    id: addedUser._id,
    email: addedUser.email,
  });

  res.status(201).json({
    status: "success",
    message: "Signup successful",
    data: addedUser,
    token,
  });
});

const login = asyncHandler(async (req, res, next) => {
  const userData = req.body;
  //   console.log("userData", userData);
  const user = await UserModel.findOne({ email: userData?.email }).select(
    "+password"
  );

  if (
    !user ||
    !(await user.comparePassword(userData?.password, user.password))
  ) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateJWTToken({
    id: user?._id,
    email: user?.email,
  });

  res.status(200).json({
    status: "success",
    message: "Login successful",
    // data: user, // does not matter when login, if still sending this user to client, hde password field.
    token,
  });
});

/**
 * Implementing password reset functionality:
 * 1. User provides an emailId to a post request at 'forget-password' route.
 * 2. If the emailId exists in the database, then send an email to the user with a link to reset the password, also send 'reset-token'.
 * reset-token is a simple random token, not a jwt token.
 * 3. User sends the token along with new password to the reset-password route.
 */

// forgotPassword only receives the email address.
const forgotPassword = asyncHandler(async (req, res, next) => {
  // Steps:
  // get user based on posted email
  // generate random token, send it to client as an email.
  console.log("Email: ", req.body?.email);
  const user = await UserModel.findOne({ email: req.body?.email });
  if (!user) {
    throw new AppError("No user found with this email", 404);
  }

  // generate random token for user, by using instance method on the UserModel
  const resetToken = await user.createPasswordResetToken();
  // in the above step we modified the user document, so we need to save it again.
  await user.save({ validateBeforeSave: false }); // this will deactivate all the validations in our model.
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}${API}${VERSION}/auth/reset-password/${resetToken}`;

  // await sendEmailNodeMailer({
  //   email: user.email || req.body?.email,
  //   subject: "Your password reset token (valid for 10 minutes)",
  //   message: `To reset your password, click on the link below:\n\n${resetURL}\n\nIf you didn't request this, please ignore this email.`,
  // });

  // The send email functionality may fail and we get error, in that case we must send error response to the client, plus we must also delete the password reset token and password reset expiry from the user document. Now since we need more than simply sending error to the client, we need to create a custom try-catch block.
  try {
    await sendEmailNodeMailer({
      email: user.email || req.body?.email,
      subject: "Your password reset token (valid for 10 minutes)",
      message: `To reset your password, click on the link below:\n\n${resetURL}\n\nIf you didn't request this, please ignore this email.`,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError(
      "There was an error sending the email. Try again later",
      500
    );
  }
});

// resetPassword receives the reset-token and new password
const resetPassword = asyncHandler(async (req, res, next) => {
  /**
   * Steps:
   * 1. Get user based on the token
   * 2. If token has not expired, and user exists, set the new password
   * 3. Update changedPasswordAt property for the user
   * 4. Log the user in, send JWT
   * 5. Delete passwordResetToken and passwordResetExpires
   */

  // the token sent to client was not encrypted but the token stored in DB is encrypted, hence need hashing.
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params?.token)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  user.password = req.body.password;
  user.confirm_password = req.body.confirm_password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // use save instead of findOneAndUpdate to run validators.

  // log the user in
  const token = generateJWTToken({
    id: user._id,
    email: user.email,
  });

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    token,
  });
});

const updatePassword = asyncHandler(async (req, res, next) => {
  /**
   * Steps:
   * 1. Get user from DB
   * 2. Check if posted current password is correct
   * 3. If correct, update password
   * 4. Log user in
   */
  const user = await UserModel.findById(req.user.id).select("+password");
  // since this route run only for authenticated users, so therefore we've 'user' object on our 'req' object.
  if (!user) {
    throw new AppError("No user found with this id", 404);
  }

  if (
    !(await user.comparePassword(req.body?.current_password, user.password))
  ) {
    throw new AppError("Invalid password entered", 401);
  }

  user.password = req.body?.new_password;
  user.confirm_password = req.body?.confirm_password;
  await user.save();

  // log the user in
  const token = generateJWTToken({
    id: user._id,
    email: user.email,
  });
  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
    token,
  });
});

// give user the facility to delete their account, we do the soft delete by setting active=false.
const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  if (!user) {
    throw new AppError("No user found with this id", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Account deleted successfully",
  });
});

module.exports = {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  updatePassword,
  deleteAccount,
};
