'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var UserSchema = Schema({
    username: String,
    email: String,
    password: String,
    rol: String
})

module.exports = mongoose.model('user', UserSchema);