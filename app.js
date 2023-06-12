const express = require('express');
const mongoose = require('mongoose');

const app = express();

// app.get('/', (req, res) => {
//   res.send('hellos gigi');
// });

const routerUser = require('./routes/users');

const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(express.json());
app.use('/users', routerUser);

// подключаем мидлвары, роуты и всё остальное...

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('server is running on port 3000');
  // eslint-disable-next-line no-console
  // console.log(process.env);
});
