'use strict'
var Cart = require('../models/cart.model');
var Product = require('../models/product.model');

function addProductToCart(req, res) {
    var params = req.body;
    if(params.product_id && params.cuantity_to_buy) {
        Product.findById(params.product_id).exec((err, productFinded) => {
            if(err) {
                return res.status(500).send({message: 'Error general'});
            } else if(!productFinded) {
                return res.status(404).send({message: 'El Producto que quiere agregar no existe.'});
            } else {
                Cart.findOne({ owner: req.user.sub }).exec((err, cartFinded) => {
                    if(err) {
                        return res.status(500).send({message: 'Error general'});
                    } else if(!cartFinded) {
                        return res.status(404).send({message: 'No se encontro su carrito'});
                    } else {
                        Cart.findOne({ owner: req.user.sub, products: { $elemMatch: { productId: params.product_id } } }).exec((err, productsExistsInCart) => {
                            if(err) {
                                return res.status(500).send({message: 'Error general'});
                            } else if(!productsExistsInCart) {
                                Cart.findOneAndUpdate({ owner: req.user.sub }, { $push: { products: { productId: params.product_id, cuantity_to_buy: params.cuantity_to_buy } } }, { new: true}, (err, newProductAdded) => {
                                    if(err) {
                                        return res.status(500).send({message: 'Error general'});
                                    } else if(!newProductAdded) {
                                        return res.status(404).send({message: 'No se pudo agregar el producto al carrito.'});
                                    } else {
                                        return res.status(200).send({data: newProductAdded});
                                    }
                                });
                            } else {
                                Cart.findOneAndUpdate({ _id: productsExistsInCart._id, 'products.productId': params.product_id }, { $inc: { 'products.$.cuantity_to_buy': params.cuantity_to_buy } }, { new: true}, (err, productIncremented) => {
                                    if(err) {
                                        return res.status(500).send({message: 'Error general'});
                                    } else if(!productIncremented) {
                                        return res.status(404).send({message: 'No se puedieron agregar mas productos al carrito.'});
                                    } else {
                                        return res.status(200).send({data: productIncremented});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).send({message: 'Debe proporcionar el codigo del producto y la cantidad que quiere agregar a su carrito'});
    }
}

function decrementProductToCart(req, res) {
    var params = req.body;
    if(params.product_id && params.amount_to_subtract) {
        Product.findById(params.product_id).exec((err, productFinded) => {
            if(err) {
                return res.status(500).send({message: 'Error general'});
            } else if(!productFinded) {
                return res.status(404).send({message: 'El Producto no existe.'});
            } else {
                Cart.findOne({ owner: req.user.sub }).exec((err, cartFinded) => {
                    if(err) {
                        return res.status(500).send({message: 'Error general'});
                    } else if(!cartFinded) {
                        return res.status(404).send({message: 'No se encontro su carrito'});
                    } else {
                        Cart.findOne({ owner: req.user.sub, 'products.productId': params.product_id }, { 'products.$': 1, '_id': 0 }).exec((err, productsExistsInCart) => {
                            if(err) {
                                return res.status(500).send({message: 'Error general'});
                            } else if(!productsExistsInCart) {
                               return res.status(404).send({message: 'El producto no existe en su carrito'});
                            } else {
                                if(productsExistsInCart.products[0].cuantity_to_buy >= params.amount_to_subtract) {
                                    Cart.findOneAndUpdate({ owner: req.user.sub, 'products.productId': params.product_id }, { $inc: { 'products.$.cuantity_to_buy': (params.amount_to_subtract * -1) } }, { new: true}, (err, productDecremented) => {
                                        if(err) {
                                            return res.status(500).send({message: 'Error general'});
                                        } else if(!productDecremented) {
                                            return res.status(404).send({message: 'No se pudo decrementar la cantidad de producto'});
                                        } else {
                                            return res.status(200).send({data: productDecremented});
                                        }
                                    });
                                } else {
                                    return res.status(400).send({message: 'Tiene menos productos en tu carrito de los que quiere remover'});
                                }
                            }
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).send({message: 'Debe proporcionar el codigo del producto y la cantidad que quiere agregar a su carrito'});
    }
}

function removeProduct(req, res) {
    var params = req.body;
    if(params.product_id) {
        Product.findById(params.product_id).exec((err, productFinded) => {
            if(err) {
                return res.status(500).send({message: 'Error general'});
            } else if(!productFinded) {
                return res.status(404).send({message: 'El Producto que quiere remover no existe.'});
            } else {
                Cart.findOne({ owner: req.user.sub }).exec((err, cartFinded) => {
                    if(err) {
                        return res.status(500).send({message: 'Error general'});
                    } else if(!cartFinded) {
                        return res.status(404).send({message: 'No se encontro su carrito'});
                    } else {
                        Cart.findOne({ owner: req.user.sub, products: { $elemMatch: { productId: params.product_id } } }).exec((err, productsExistsInCart) => {
                            if(err) {
                                return res.status(500).send({message: 'Error general'});
                            } else if(!productsExistsInCart) {
                               return res.status(404).send({message: 'El producto no existe en su carrito'});
                            } else {
                                Cart.findOneAndUpdate({ owner: req.user.sub }, { $pull: { products: { productId: params.product_id } } }, { new: true}, (err, productRemoved) => {
                                    if(err) {
                                        return res.status(500).send({message: 'Error general'});
                                    } else if(!productRemoved) {
                                        return res.status(404).send({message: 'No se puedieron agregar mas productos al carrito.'});
                                    } else {
                                        return res.status(200).send({data: productRemoved});
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).send({message: 'Debe proporcionar el codigo del producto y la cantidad que quiere agregar a su carrito'});
    }
}

module.exports = {
    addProductToCart,
    decrementProductToCart,
    removeProduct
}