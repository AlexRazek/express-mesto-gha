require('dotenv').config();
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
const { CREATED, SUCCESS } = require('../utils/success');

const SALT_ROUNDS = 10;

// eslint-disable-next-line max-len
const { JWT_SECRET = 'secret-code' } = process.env;

const User = require('../models/user');
const BadRequestError = require('../utils/errors/bad-request-error');
const NotFoundError = require('../utils/errors/not-found-error');
const ConflictRequest = require('../utils/errors/conflict-request-error');

// получение всех пользователей
const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS).send(users));
};

// получение данных о своем id
const getUserMe = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      }
      return res.status(SUCCESS).send(user);
    })
    .catch(next);
};

// получение информации о пользователе по id
const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return res.status(SUCCESS).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные _id'));
      } else {
        next(err);
      }
    });
};

// авторизация пользователя
const login = (req, res, next) => {
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
        });
      // .end(); // если у ответа нет тела, можно использовать метод end
      // вернём токен
      res.send({ token });
    })
    .catch(next);
};

// регистрация пользователя
const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль через bcrypt
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then(() => {
      res.status(CREATED).send({
        name, about, avatar, email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictRequest('При регистрации указан email, который уже существует на сервере'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      } else {
        next(err);
      }
    });
};

// обновление данных Профиля пользователя
const updateUserProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((userProfile) => res.send({ userProfile }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные для обновления профиля'));
      } else {
        next(err);
      }
    });
};

// обновление данных Аватара пользователя
const updateUserAvatar = (req, res, next) => {
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
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные для обновления аватара'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getUsers,
  getUserMe,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
  login,
};
