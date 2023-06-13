const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors');
const { CREATED, SUCCESS } = require('../utils/success');

const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(SUCCESS).send(cards))
    .catch(() => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((newCard) => {
      res.status(CREATED).send({ data: newCard });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании карточки',
          // eslint-disable-next-line no-shadow
          // message: `${Object.values(err.errors).map((err) => err.message).join(', ')}`,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

const deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        res.status(SUCCESS).send({ data: card });
      } else {
        res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({
          // eslint-disable-next-line no-shadow
          message: 'Переданы некорретные данные',
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.status(SUCCESS).send({ cardData: card });
      } else {
        res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({
          // eslint-disable-next-line no-shadow
          message: 'Переданы некорректные данные для постановки/снятии лайка',
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.status(SUCCESS).send({ data: card });
      } else {
        res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({
        // eslint-disable-next-line no-shadow
          message: 'Переданы некорректные данные для постановки/снятии лайка',
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'Ошибка сервера' });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
