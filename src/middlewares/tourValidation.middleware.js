const Joi = require("joi");

const tourValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.base": "Tour name must be a string",
    "any.required": "Tour name is required",
  }),

  duration: Joi.number().required().messages({
    "number.base": "Duration must be a number",
    "any.required": "Duration is required",
  }),

  maxGroupSize: Joi.number().required().messages({
    "number.base": "Max group size must be a number",
    "any.required": "Max group size is required",
  }),

  difficulty: Joi.string()
    .valid("easy", "medium", "difficult")
    .required()
    .messages({
      "any.only": "Difficulty must be one of: easy, medium, difficult",
      "any.required": "Difficulty is required",
    }),

  ratingsAverage: Joi.number().min(0).max(5).default(4.5).messages({
    "number.base": "Ratings average must be a number",
    "number.min": "Ratings average must be at least 0",
    "number.max": "Ratings average cannot exceed 5",
  }),

  ratingsQuantity: Joi.number().min(0).default(0).messages({
    "number.base": "Ratings quantity must be a number",
    "number.min": "Ratings quantity cannot be negative",
  }),

  price: Joi.number().required().messages({
    "number.base": "Price must be a number",
    "any.required": "Price is required",
  }),

  summary: Joi.string().trim().required().messages({
    "string.base": "Summary must be a string",
    "any.required": "Summary is required",
  }),

  description: Joi.string().trim().required().messages({
    "string.base": "Description must be a string",
    "any.required": "Description is required",
  }),

  imageCover: Joi.string().required().messages({
    "string.base": "Cover image must be a string",
    "any.required": "Cover image is required",
  }),

  images: Joi.array().items(Joi.string()).messages({
    "array.base": "Images must be an array of strings",
  }),

  startDates: Joi.array().items(Joi.date()).messages({
    "array.base": "Start dates must be an array of valid dates",
    "date.base": "Each start date must be a valid date",
  }),
});

const validateTour = (req, res, next) => {
  // console.log("Executing tour validations");
  const { error } = tourValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors: errorMessages,
    });
  }
  next();
};

module.exports = validateTour;
