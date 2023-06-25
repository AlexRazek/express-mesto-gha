require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./middlewares/auth');

const { createUser, login } = require('./controllers/users');

const { NOT_FOUND } = require('./utils/errors/errors');

const { PORT, MONGO_URI } = process.env;

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
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
});

// app.use((req, res, next) => {
//   req.user = {
//     _id: '64863f8b1e71d6c164ddbd1a', // вставьте сюда _id созданного в предыдущем пункте пользов
//   };
//   next();
// });

app.post('/signin', login);
app.post('/signup', createUser);

app.use(auth);

app.use('/users', routerUser);
app.use('/cards', routerCard);
app.all('*', (req, res) => res.status(NOT_FOUND).send({ message: 'Путь не существует' }));
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on port 3000');
});
