'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var CategorySchema = Schema({
    category_name: String
})

module.exports = mongoose.model('category', CategorySchema);