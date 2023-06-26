const jwt = require('jsonwebtoken');
const Unauthorized = require('../utils/errors/unauthorized');

const { JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  // eslint-disable-next-line no-console
  console.log(req.headers.authorization);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new Unauthorized('Передан неверный логин или пароль'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
    // eslint-disable-next-line no-console
    console.log(payload);
  } catch (err) {
    next(new Unauthorized('Передан неверный логин или пароль'));
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};
