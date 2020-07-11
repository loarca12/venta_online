'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = Schema({
    product_name: String,
    cuantity: Number,
    price: Number,
    sales: Number,
    category: {type: Schema.Types.ObjectId, ref:'category'}
})

module.exports = mongoose.model('product', ProductSchema);