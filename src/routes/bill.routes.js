'use strict'
const BillController = require('../controllers/bill.controller');
const express = require('express');
const api = express.Router();
const md_auth = require('../middlewares/authenticated');

api.post('/createBill', md_auth.ensureAuth, BillController.createBill);
api.post('/generate-my-bill', md_auth.ensureAuth, BillController.createPDF);
api.get('/get-bills-of-user', md_auth.ensureAuth, BillController.findBillsOfUser);
api.get('/get-my-bills', md_auth.ensureAuth, BillController.findMyBills);

module.exports = api;