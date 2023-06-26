// const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors/errors');
const { CREATED, SUCCESS } = require('../utils/success');

const Card = require('../models/card');
const BadRequestError = require('../utils/errors/bad-request-error');
const NotFoundError = require('../utils/errors/not-found-error');
const Forbidden = require('../utils/errors/forbidden');

// function thenResponse(card, err, next) {
//   if (!card) {
//     next(new NotFoundError('Передан несуществующий _id карточки'));
//   } else {
//     next(err);
//   }
// }

// function catchResponse(err, next) {
//   if (err.name === 'CastError') {
//     next(new BadRequestError('Переданы некорректные данные для постановки/снятия лайка'));
//   }
//   next(err);
// }

// получение списка карточек
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.status(SUCCESS).send(cards))
    .catch(next);
  //   res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  // });
};

// создание карточки
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((newCard) => {
      res.status(CREATED).send({ newCard });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

// удаление карточки и запрет на удаление не своей карточки
const deleteCardById = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка с указанным _id не найдена'));
      } if (card.owner !== req.user._id) {
        next(new Forbidden('Попытка удалить чужую карточку'));
      }
      return card.remove()
        .then(() => res.status(SUCCESS).send({ card }));
    })
    // .then((card) => {
    //   if (card) {
    //     return res.status(SUCCESS).send({ card });
    //   } if (!card) {
    //     next(new NotFoundError('Карточка с указанным _id не найдена'));
    //   } if (card.owner !== req.user._id) {
    //     next(new Forbidden('Попытка удалить чужую карточку'));
    //   }
    // })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для удаления карточки'));
      } else {
        next(err);
      }
    });
};

// установка лайка
const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Передан несуществующий _id карточки'));
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для установки лайка'));
      } else {
        next(err);
      }
    });
};

// удаление лайка
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Передан несуществующий _id карточки'));
      }
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  likeCard,
  dislikeCard,
};
