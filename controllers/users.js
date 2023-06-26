require('dotenv').config();
const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken');
// const {
// BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED,
// } = require('../utils/errors/errors');
// const { UNAUTHORIZED } = require('../utils/errors/errors');
const { CREATED, SUCCESS } = require('../utils/success');

const SALT_ROUNDS = 10;

const { JWT_SECRET } = process.env;

const User = require('../models/user');
const BadRequestError = require('../utils/errors/bad-request-error');
const NotFoundError = require('../utils/errors/not-found-error');
const ConflictRequest = require('../utils/errors/conflict-request-error');

// function catchResponse(err, res, next) {
//   if (err.name === 'ValidationError') {
//     next(new BadRequestError('Переданы некорректные данные для обновления аватара/профиля'));
//     // return res.status(BAD_REQUEST).send({
//     //   message: 'Переданы некорректные данные для обновления аватара/профиля',
//     // });
//   } else {
//     next(err);
//   }
//   // return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
// }

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS).send(users));
};

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

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      // eslint-disable-next-line no-console
      console.log(process.env.JWT_SECRET);
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
      // eslint-disable-next-line no-console
      console.log(req.cookies.jwt);
    })
    .catch(next);
  // .catch(() => {
  // res.status(UNAUTHORIZED).send({ message: 'Передан неверный логин или пароль' });
  // });
};

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
        // return res.status(BAD_REQUEST).send({
        //   message: 'Переданы некорректные данные для обновления аватара/профиля',
        // });
      } else {
        next(err);
      }
    // return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
    });
};

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
        // return res.status(BAD_REQUEST).send({
        //   message: 'Переданы некорректные данные для обновления аватара/профиля',
        // });
      } else {
        next(err);
      }
    // return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
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
