'use strict'
const express = require('express');
const CategoryController = require('../controllers/category.controller');
const md_auth = require('../middlewares/authenticated');
var api = express.Router();

api.post('/createCategory', md_auth.ensureAuth, CategoryController.createCategory);
api.get('/findCategories', CategoryController.findCategories);
api.put('/editCategory', md_auth.ensureAuth, CategoryController.editCategory);
api.delete('/deleteCategory', md_auth.ensureAuth, CategoryController.deleteCategory);

module.exports = api;