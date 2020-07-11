'use strict'
const express = require('express');
const api = express.Router();
const ProductController = require('../controllers/product.controller');
const md_auth = require('../middlewares/authenticated');

api.post('/createProduct', md_auth.ensureAuth, ProductController.createProduct);
api.get('/findProducts', ProductController.findProducts);
api.get('/findProductsByCategory', ProductController.findProductsByCategory);
api.put('/editProduct', md_auth.ensureAuth, ProductController.editProduct);
api.delete('/deleteProduct', md_auth.ensureAuth, ProductController.deleteProduct);
api.get('/soldOutProducts', ProductController.soldOutProducts);
api.get('/mostSalesProducts', ProductController.mostSalesProducts);

module.exports = api;