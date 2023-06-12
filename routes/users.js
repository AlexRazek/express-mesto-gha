const routerUser = require('express').Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

routerUser.get('/', getUsers);
routerUser.get('/:userId', getUserById);
routerUser.post('/', createUser);
routerUser.patch('/me', updateUserProfile);
routerUser.patch('/me/avatar', updateUserAvatar);

module.exports = routerUser;
