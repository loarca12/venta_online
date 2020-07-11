'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');

var secret = 'password';

exports.createToken = function(user) {
    var payload = {
        sub: user._id,
        username: user.username,
        email: user.email,
        rol: user.rol,
        iat: moment().unix(),
        exp: moment().day(25, 'days').unix()
    }
    return jwt.encode(payload, secret);
}