require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { NOT_FOUND } = require('./utils/errors');

const app = express();

const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// код ниже оставлен по причине того, что тесты не видят mondoDB URI, спрятанную в .env
// mongoose.connect('mongodb://localhost:27017/mestodb', {
//   useNewUrlParser: true,
// });

// убрал mondoDB URI в .env, но тесты не видят
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '64863f8b1e71d6c164ddbd1a', // вставьте сюда _id созданного в предыдущем пункте пользовате
  };
  next();
});

app.use('/users', routerUser);
app.use('/cards', routerCard);

app.all('*', (req, res) => res.status(NOT_FOUND).send({ message: 'Путь не существует' }));

app.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on port 3000');
});
