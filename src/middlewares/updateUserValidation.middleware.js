const Joi = require("joi");

// Schema for validating allowed fields during user update
const updateUserSchema = Joi.object({
  name: Joi.string().trim(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } }),

  photo: Joi.string().trim(),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update the user",
  });

const updateUserValidation = (req, res, next) => {
  // Check for forbidden fields manually
  const forbiddenFields = [
    "password",
    "confirm_password",
    "isDeleted",
    "passwordChangedAt",
  ];
  const attemptedForbiddenUpdates = forbiddenFields.filter((field) =>
    Object.prototype.hasOwnProperty.call(req.body, field)
  );

  if (attemptedForbiddenUpdates.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: `You are not allowed to update the following fields: ${attemptedForbiddenUpdates.join(
        ", "
      )}`,
    });
  }

  const { error } = updateUserSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((err) => err.message);
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors,
    });
  }

  next();
};

module.exports = updateUserValidation;
