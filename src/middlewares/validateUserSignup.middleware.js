const Joi = require("joi");

const userSignupSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.base": "Password must be a string",
    "string.min": "Password must be at least 8 characters long",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),

  confirm_password: Joi.string()
    .required()
    .valid(Joi.ref("password"))
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
      "any.required": "Confirm password is required",
    }),

  photo: Joi.string().optional().messages({
    "string.base": "Photo must be a string",
  }),

  role: Joi.string()
    .valid("user", "guide", "lead-guide", "admin")
    .optional()
    .messages({
      "any.only": "Role must be one of: user, guide, lead-guide, admin",
      "string.base": "Role must be a string",
    }),
});

const validateUserSignup = (req, res, next) => {
  const { error } = userSignupSchema.validate(req.body, {
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

module.exports = validateUserSignup;
