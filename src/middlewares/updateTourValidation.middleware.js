const Joi = require("joi");

const updateTourSchema = Joi.object({
  name: Joi.string(),

  duration: Joi.number(),

  maxGroupSize: Joi.number(),

  difficulty: Joi.string().valid("easy", "medium", "difficult"),

  ratingsAverage: Joi.number().min(0).max(5),

  ratingsQuantity: Joi.number().min(0),

  price: Joi.number(),

  summary: Joi.string().trim(),

  description: Joi.string().trim(),

  imageCover: Joi.string(),

  images: Joi.array().items(Joi.string()),

  startDates: Joi.array().items(Joi.date()),
})
  .min(1)
  .messages({
    "object.min": "At least one field is required to update the tour",
  });

const validateUpdateTour = (req, res, next) => {
  const bodyValidation = updateTourSchema.validate(req.body, {
    abortEarly: false,
  });

  const errors = [];

  if (bodyValidation.error) {
    const bodyErrors = bodyValidation.error.details.map((err) => err.message);
    errors.push(...bodyErrors);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors,
    });
  }

  next();
};

module.exports = validateUpdateTour;
