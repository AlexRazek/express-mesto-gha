const { celebrate, Joi } = require('celebrate');
const routerUser = require('express').Router();
const {
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

routerUser.get('/', getUsers);

routerUser.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().alphanum(),
  }),
}), getUserById);

routerUser.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUserProfile);

routerUser.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    about: Joi.string().required(),
  }),
}), updateUserAvatar);

module.exports = routerUser;
