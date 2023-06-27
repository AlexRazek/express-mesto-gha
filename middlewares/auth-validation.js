const { celebrate, Joi } = require('celebrate');

const urlPattern = require('../utils/pattern/url-pattern');

const SignupValidationJoi = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(urlPattern),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

const SigninValidationJoi = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

module.exports = {
  SignupValidationJoi,
  SigninValidationJoi,
};
