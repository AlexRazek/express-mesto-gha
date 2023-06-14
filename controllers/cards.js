const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors');
const { CREATED, SUCCESS } = require('../utils/success');

const Card = require('../models/card');

function thenResponse(res, card) {
  if (card) {
    return res.status(SUCCESS).send({ card });
  }
  return res.status(NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
}

function catchResponse(res, err) {
  if (err.name === 'CastError') {
    return res.status(BAD_REQUEST).send({
      message: 'Переданы некорректные данные для снятия лайка',
    });
  }
  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
}

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.status(SUCCESS).send(cards))
    .catch(() => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((newCard) => {
      res.status(CREATED).send({ newCard });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании карточки',
          // eslint-disable-next-line no-shadow
          // message: `${Object.values(err.errors).map((err) => err.message).join(', ')}`,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        return res.status(SUCCESS).send({ card });
      }
      return res.status(NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({
          message: 'Переданы некорретные данные',
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      thenResponse(res, card);
    })
    .catch((err) => {
      catchResponse(res, err);
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      thenResponse(res, card);
    })
    .catch((err) => {
      catchResponse(res, err);
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
