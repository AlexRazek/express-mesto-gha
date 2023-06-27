const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // импортируем bcrypt
// const validator = require('validator'); // импортируем validator
const isUrl = require('validator/lib/isURL');
const isEmail = require('validator/lib/isEmail');
const Unauthorized = require('../utils/errors/unauthorized');
// const urlPattern = require('../utils/pattern/url-pattern');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    maxLength: 30,
    required: false,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minLength: 2,
    maxLength: 30,
    required: false,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: false,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (isValid) => isUrl(isValid),
      // validator(v) {
      //   return urlPattern.test(v);
      // },
      message: 'Некорректная ссылка на аватар',
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (isValid) => isEmail(isValid),
      // validator(v) {
      //   return /^\S+@\S+\.\S+$/.test(v);
      // },
      message: 'Почта введена не корректно',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Unauthorized('Неправильные почта или пароль'));
          }

          return user; // теперь user доступен
        });
    });
};

module.exports = mongoose.model('user', userSchema);
