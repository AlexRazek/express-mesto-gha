const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { NOT_FOUND } = require('./utils/errors');

const app = express();

// app.get('/', (req, res) => {
//   res.send('hellos gigi');
// });

const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '64863f8b1e71d6c164ddbd1a', // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

app.use(express.json());
app.use('/users', routerUser);
app.use('/cards', routerCard);

app.use((req, res) => res.status(NOT_FOUND).send({ message: 'Путь не существует' }));

// подключаем мидлвары, роуты и всё остальное...

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on port 3000');
  // eslint-disable-next-line no-console
  // console.log(process.env);
});
