const Joi = require("joi");
const mongoose = require("mongoose");

const objectIdValidator = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "ObjectId Validation")
  .required()
  .messages({
    "any.required": "ID is required",
    "any.invalid": "Invalid ID format",
  });

const validateIdParam = (req, res, next) => {
  const { error } = objectIdValidator.validate(req.params.id);
  if (error) {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors: [error.message],
    });
  }
  next();
};

module.exports = validateIdParam;
