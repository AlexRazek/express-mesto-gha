const { BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR } = require('../utils/errors');
const { CREATED, SUCCESS } = require('../utils/success');

const User = require('../models/user');

function catchResponse(err, res) {
  if (err.name === 'ValidationError') {
    return res.status(BAD_REQUEST).send({
      message: 'Переданы некорректные данные для обновления аватара/профиля',
    });
  }
  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
}

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS).send(users));
};

const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' });
      }
      return res.status(SUCCESS).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(BAD_REQUEST).send({ message: 'Передан неверный тип _id' });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((newUser) => {
      res.status(CREATED).send(newUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({
          message: 'Переданы некорректные данные при создании пользователя',
          // eslint-disable-next-line no-shadow
          // message: `${Object.values(err.errors).map((err) => err.message).join(', ')}`,
        });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

const updateUserProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((userProfile) => res.send({ userProfile }))
    .catch((err) => catchResponse(err, res));
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((userAvatar) => res.send({
      _id: userAvatar._id,
      avatar: userAvatar.avatar,
      name: userAvatar.name,
      about: userAvatar.about,
    }))
    .catch((err) => catchResponse(err, res));
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
};
