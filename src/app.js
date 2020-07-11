'use strict'


var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var path = require('path');

var USER_ROUTES = require('./routes/user.routes');
var CATEGORY_ROUTES = require('./routes/category.routes');
var PRODUCT_ROUTES = require('./routes/product.routes');
var CART_ROUTES = require('./routes/cart.routes');
var BILL_ROUTES = require('./routes/bill.routes');

// pdf
app.use(express.static(path.resolve('public')));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    
    next();
})


app.use('/api', USER_ROUTES);
app.use('/api', CATEGORY_ROUTES);
app.use('/api', PRODUCT_ROUTES);
app.use('/api', CART_ROUTES);
app.use('/api', BILL_ROUTES);


module.exports = app;