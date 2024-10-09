const Joi = require('joi');

const validateBusiness = (data) => {
  const schema = Joi.object({
    businessName: Joi.string().min(3).max(50).required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    openingTime: Joi.string().required(),
    closingTime: Joi.string().required(),
    businessEmail: Joi.string().email().required(),
    mobileNumber: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data, { abortEarly: false });
};

const validateOwner = (data) => {
  const schema = Joi.object({
    businessName: Joi.string().min(3).max(50).required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().required(),
    openingTime: Joi.string().required(),    // e.g., "09:00 AM"
    closingTime: Joi.string().required(),    // e.g., "06:00 PM"
    email: Joi.string().required(),  // Email validation
    mobileNumber: Joi.string().required()    // Assuming phone number validation is done elsewhere
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateBusiness, validateOwner };
