const { celebrate, Joi } = require('celebrate');
const routerUser = require('express').Router();
const urlPattern = require('../utils/pattern/url-pattern');

const {
  getUsers,
  getUserMe,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

routerUser.get('/', getUsers);

routerUser.get('/me', getUserMe);

routerUser.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
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
