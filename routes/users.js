const { celebrate, Joi } = require('celebrate');
const routerUser = require('express').Router();
// eslint-disable-next-line no-useless-escape
const urlPattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
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
    avatar: Joi.string().required().pattern(urlPattern),
  }),
}), updateUserAvatar);

module.exports = routerUser;
