'use strict'
const express = require('express');
const api = express.Router();
const CartController = require('../controllers/cart.controller');
const md_auth = require('../middlewares/authenticated');

api.put('/addProductToCart', md_auth.ensureAuth, CartController.addProductToCart);
api.put('/decrementProductToCart', md_auth.ensureAuth, CartController.decrementProductToCart);
api.put('/removeProduct', md_auth.ensureAuth, CartController.removeProduct);

module.exports = api;