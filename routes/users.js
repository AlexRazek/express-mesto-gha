const routerUser = require('express').Router();
const {
  getUsers, getUserById, createUser,
  // updateUserById, deleteUserById,
} = require('../controllers/users');

routerUser.get('/', getUsers);

routerUser.get('/:id', getUserById);

routerUser.post('/', createUser);

// routerUser.patch('/:id', updateUserById);

// routerUser.delete('/:id', deleteUserById);

module.exports = routerUser;
