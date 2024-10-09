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
    fullName: Joi.string().min(3).max(50).required(),
    country: Joi.string().required(),
    email: Joi.string().email().required(),
    mobileNumber: Joi.string().required(),
    city:Joi.string().required(),
    state:Joi.string().required(),
    address:Joi.string().required()

  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateBusiness, validateOwner };
