require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundError = require('./utils/errors/not-found-error');

const { PORT } = process.env;

const app = express();

app.use(cookieParser());

// app.get('/posts', (req) => {
//   // eslint-disable-next-line no-console
//   console.log(req.cookies.jwt); // достаём токен
// });

const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');
const errorHandler = require('./middlewares/error-handler');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect оставил как есть, т.к. из .env тесты не видят mondoDB URL
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

// MongoDB URL в .env поместил:
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
// });

// app.use((req, res, next) => {
//   req.user = {
//     _id: '64863f8b1e71d6c164ddbd1a', // вставьте сюда _id созданного в предыдущем пункте пользов
//   };
//   next();
// });

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().uri(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.use('/users', auth, routerUser);
app.use('/cards', auth, routerCard);
app.all('*', (req, res, next) => {
  next(new NotFoundError('Путь не существует'));
});
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on port 3000');
});
