'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillSchema = Schema({
    enterprise: String,
    enterprise_address: String,
    NIT: String,
    bill_number: Number,
    date_of_issue: Schema.Types.Date,
    client_id: {type:Schema.Types.ObjectId, ref:'user'},
    client_name: String,
    products: [{
        bill_cuantity: Number,
        product_name: String,
        price: Number
    }],
    total: Number
})

module.exports = mongoose.model('bill', BillSchema);