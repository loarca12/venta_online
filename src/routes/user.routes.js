'use strict'
const express = require('express');
const UserController = require('../controllers/user.controller');
const md_auth = require('../middlewares/authenticated');
var api = express.Router();

//Routes
api.get('/getUsers', md_auth.ensureAuth, UserController.getUsers);
api.get('/getUserById', md_auth.ensureAuth, UserController.getUserById);
api.get('/getUsersByName', md_auth.ensureAuth, UserController.getUsersByName);
api.post('/registrar', UserController.register);
api.post('/login', UserController.login);
api.put('/editUser', md_auth.ensureAuth, UserController.editUser);
api.delete('/deleteUser', md_auth.ensureAuth, UserController.deleteUser);

module.exports = api;