'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = Schema({
    owner: {type: Schema.Types.ObjectId, ref: 'user' },
    products: [{
        productId: {type: Schema.Types.ObjectId, ref:'product'},
        cuantity_to_buy: Number
    }]
})

module.exports = mongoose.model('cart', CartSchema);