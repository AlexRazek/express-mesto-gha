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

function catchResponse(err, next) {
  if (err.name === 'ValidationError') {
    throw new BadRequestError('Переданы некорректные данные для обновления аватара/профиля');
    // return res.status(BAD_REQUEST).send({
    //   message: 'Переданы некорректные данные для обновления аватара/профиля',
    // });
  } else {
    next(err);
  }
  // return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
}

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(SUCCESS).send(users));
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден');
      // return res.status(NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' });
      }
      return res.status(SUCCESS).send(user);
    })
    .catch(next);
  // if (err.name === 'CastError') {
  // throw new BadRequestError('Передан неверный тип _id');
  //     return res.status(BAD_REQUEST).send({ message: 'Передан неверный тип _id' });
  //   }
  //  return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  // });
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
  // хешируем пароль
  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((newUser) => {
      res.status(CREATED).send(newUser);
    })
    .catch((err) => {
      if (err.code === 11000) {
        throw new ConflictRequest('При регистрации указан email, который уже существует на сервере');
      } else if (err.name === 'ValidationError') {
        throw new NotFoundError('Переданы некорректные данные при создании пользователя');
        //     return res.status(BAD_REQUEST).send({
        //       message: 'Переданы некорректные данные при создании пользователя',
        //     });
        //   }
        // return res.status(INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка'});
        // });
      } else {
        next(err);
      }
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
