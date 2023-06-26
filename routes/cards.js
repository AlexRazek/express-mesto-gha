const { celebrate, Joi } = require('celebrate');
const routerCard = require('express').Router();
const urlPattern = require('../utils/pattern/url-pattern');

const {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

routerCard.get('/', getCards);
routerCard.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().pattern(urlPattern),
  }),
}), createCard);

routerCard.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().min(20).required(),
  }),
}), deleteCardById);

routerCard.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().min(20).required(),
  }),
}), likeCard);

routerCard.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().min(20).required(),
  }),
}), dislikeCard);

module.exports = routerCard;
