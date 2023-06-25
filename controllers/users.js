const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const {
  BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED,
} = require('../utils/errors');
const { CREATED, SUCCESS } = require('../utils/success');

const { JWT_SECRET, SALT_ROUNDS } = process.env;

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

// const token = jwt.sign(
//   { _id: user._id },
//   NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'
// );

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      // отправим токен, браузер сохранит его в куках
      res
        .cookie('jwt', token, {
          // token - наш JWT токен, который мы отправляем
          maxAge: 3600000,
          httpOnly: true,
        })
        .end(); // если у ответа нет тела, можно использовать метод end
      // вернём токен
      res.send({ token });
    })
    .catch(() => {
      res.status(UNAUTHORIZED).send({ message: 'Передан неверный логин или пароль' });
    });
};

const createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
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
  login,
};
