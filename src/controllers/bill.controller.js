'use strict'
var Bill = require('../models/bill.model');
var Product = require('../models/product.model');
var Cart = require('../models/cart.model');
var puppeteer = require('puppeteer');
var handlebars = require('handlebars');
var fs = require('fs-extra');
var path = require('path');
//asyn/await para un mejor funcionamiento.
function createBill(req, res) {
    var params = req.body;
    var bill = new Bill();
    if (params.enterprise && params.enterprise_address && params.NIT && params.bill_number && params.date_of_issue) {
        Cart.findOne({ owner: req.user.sub }).exec(async (err, cartFinded) => {
            if (err) {
                return res.status(500).send({ message: 'Error general' });
            } else if (!cartFinded) {
                return res.status(404).send({ message: 'No se encontro su carrito para comprabar la compra' });
            } else {
                if (cartFinded.products.length !== 0) {
                    var finish = false;
                    var productName = '';
                    for (let index = 0; index < cartFinded.products.length; index++) {
                        const productsVerified = await Product.findOne({ _id: cartFinded.products[index].productId });
                        if (!productsVerified) {
                            return res.status(404).send({ message: 'El producto no existe' });
                        } else if (!(productsVerified.cuantity >= cartFinded.products[index].cuantity_to_buy)) {
                            productName = productsVerified.product_name
                            finish = true
                            break
                        }
                    }
                    if (finish) {
                        return res.status(400).send({ message: `El producto ${productName} no tiene las suficientes existencias como para abastecer su compra. Remueva el producto o disminuya la cantidad que quiere comprar.` });
                    }
                    for (let index = 0; index < cartFinded.products.length; index++) {
                        Product.findOne({ _id: cartFinded.products[index].productId }).exec((err, product) => {
                            if (err) {
                                return res.status(500).send({ message: 'Error general' });
                            } else if (!product) {
                                return res.status(404).send({ message: 'El producto no existe' });
                            } else {
                                Product.findByIdAndUpdate(product._id, { $inc: { cuantity: (cartFinded.products[index].cuantity_to_buy * -1), sales: cartFinded.products[index].cuantity_to_buy } }).exec((err, productUpdatedD) => {
                                    if (err) {
                                        return res.status(500).send({ message: 'Error general' });
                                    } else if (!productUpdatedD) {
                                        return res.status(400).send({ message: 'No se pude decrementar' });
                                    }
                                });
                            }
                        });
                    }
                    bill.enterprise = params.enterprise
                    bill.enterprise_address = params.enterprise_address
                    bill.NIT = params.NIT
                    bill.bill_number = params.bill_number
                    bill.date_of_issue = params.date_of_issue
                    bill.client_id = req.user.sub
                    bill.client_name = req.user.username
                    bill.products = []
                    bill.total = 0
                    bill.save((err, saved) => {
                        const billSaved = saved
                        if (err) {
                            return res.status(500).send({ message: 'Error general' });
                        } else if (!saved) {
                            return res.status(400).send({ message: 'No se ha podido crear la factura' });
                        } else {
                            for (let index = 0; index < cartFinded.products.length; index++) {
                                Product.findOne({ _id: cartFinded.products[index].productId }).exec((err, product) => {
                                    if (err) {
                                        return res.status(500).send({ message: 'Error general' });
                                    } else if (!product) {
                                        return res.status(404).send({ message: 'El producto no existe' });
                                    } else {
                                        Bill.findByIdAndUpdate(billSaved._id, { $push: { products: { bill_cuantity: cartFinded.products[index].cuantity_to_buy, product_name: product.product_name, price: product.price } }, $inc: { total: (cartFinded.products[index].cuantity_to_buy * product.price) } }, { new: true }, (err, productAdded) => {
                                            if (err) {
                                                return res.status(500).send({ message: 'Error general' });
                                            } else if (!productAdded) {

                                                return res.status(404).send({ message: 'El producto no se pudo agregar a la factura' });
                                            }
                                        });
                                    }
                                });
                            }
                            Cart.findOneAndUpdate({ owner: req.user.sub }, { products: [] }, { new: true }, (err, cartDeleted) => {
                                if (err) {
                                    return res.status(500).send({ message: 'Error general' });
                                } else if (!cartDeleted) {
                                    return res.status(404).send({ message: 'No se pudo limpiar el carrito' });
                                }
                            });
                            Bill.findById(billSaved._id).exec((err, billFinished) => {
                                if (err) {
                                    return res.status(500).send({ message: 'Error general' });
                                } else if (!billFinished) {
                                    return res.status(404).send({ message: 'No se encontro la factura' });
                                } else {
                                    return res.status(201).send({ data: billFinished });
                                }
                            });

                        }
                    });

                } else {
                    return res.status(400).send({ message: 'No tiene ningun producto agregado a su carrito' });
                }
            }
        });
    } else {
        return res.status(400).send({ messagge: 'Debe de rellenar todos los campos necesarios' });
    }
}

async function createPDF(req, res) {
    var params = req.body;
    try {
        if (params.billId) {
            const billData = await Bill.findOne({ _id: params.billId });
            if (billData.client_id == req.user.sub) {
                const dataToJson = await billData.toJSON()
                const filePath = path.join(process.cwd(), 'src', 'templates', 'bill.template.hbs');
                const html = await fs.readFile(filePath, 'utf-8');
                const content = handlebars.compile(html)(dataToJson);
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.setContent(content);
                const billFolder = await fs.exists(path.join(process.cwd(), 'public', 'bills'));
                if (!billFolder) {
                    await fs.mkdir(path.join(process.cwd(), 'public'));
                    await fs.mkdir(path.join(process.cwd(), 'public', 'bills'));
                }
                await page.pdf({
                    path: path.join(process.cwd(), 'public', 'bills', `${billData.client_name}-${parseInt(Date.now())}.pdf`),
                    format: 'A4',
                    printBackground: true
                });
                return res.status(201).send({ message: 'PDF creado correctamente' });
            } else {
                return res.status(401).send({ message: 'La factura que quieres generar no es de tu propiedad' });
            }
        } else {
            return res.status(400).send({ message: 'Debe de proporcionar el id de la factura' });
        }
    } catch (error) {
        console.error(error)
        return res.status(500).send({ message: 'Error General' });
    }
}

function findMyBills(req, res) {
    var params = req.body;
    if (!params.bill) {
        Bill.find({ client_id: req.user.sub }).exec((err, bills) => {
            if (err) {
                return res.status(500).send({ message: 'Error General' });
            } else {
                return res.status(200).send({ data: bills });
            }
        });
    } else {
        Bill.findById(params.bill).exec((err, bill) => {
            if (err) {
                return res.status(500).send({ message: 'Error General' });
            } else if (bill.client_id == req.user.sub) {
                return res.status(200).send({ data: bill });
            } else {
                return res.status(400).send({ message: 'La factura que buscas no existe o no es de tu propiedad' });
            }
        });
    }
}

function findBillsOfUser(req, res) {
    if (req.user.rol === 'ROLE_ADMIN') {
        var params = req.body;
        if (params.id) {
            Bill.find({ client_id: params.id }).exec((err, bills) => {
                if (err) {
                    return res.status(500).send({ message: 'Error General' });
                } else {
                    return res.status(200).send({ data: bills });
                }
            });
        } else {
            return res.status(400).send({ message: ' rellene todos los datos' });
        }
    } else {
        return res.status(500).send({ message: 'no tienes los permisos suficientes' });
    }
}

module.exports = {
    createBill,
    createPDF,
    findMyBills,
    findBillsOfUser
}