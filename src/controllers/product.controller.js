'use strict'
const Product = require('../models/product.model');
const Category = require('../models/category.model');

function createProduct(req, res) {
    if(req.user.rol === 'ROLE_ADMIN') {
        var product = new Product();
        var params = req.body;
        if(params.product_name && params.cuantity && params.price && params.category) {
            Category.findById(params.category, (err, categoryFinded) => {
                if(err) {
                    return res.status(500).send({ message: 'Error General'});
                } else if(!categoryFinded) {
                    return res.status(404).send({ message: 'La categoria a la cual quiere agregar el producto no existe' });
                } else {
                    product.product_name = params.product_name
                    product.cuantity = params.cuantity
                    product.price = params.price
                    product.category = params.category
                    product.sales = 0
                    product.save((err, saved) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error General'});
                        } else if(!saved) {
                            return res.status(400).send({ message: 'Error al guardar el producto'});
                        } else {
                            return res.status(200).send({ data: saved});
                        }
                    });
                }
            });
        } else if(params.product_name && params.cuantity && params.price) {
            Category.findOne({category_name: 'default'}).exec((err, defaultFinded) => {
                if(err) {
                    return res.status(500).send({ message: 'Error General'});
                } else if(!defaultFinded) {
                    var category = new Category();
                    category.category_name = 'default'
                    category.save((err, categorySaved) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error general.' });
                        } else if(categorySaved) {
                            product.product_name = params.product_name
                            product.cuantity = params.cuantity
                            product.price = params.price
                            product.category = categorySaved._id
                            product.sales = 0
                            product.save((err, saved) => {
                                if(err) {
                                    return res.status(500).send({ message: 'Error General'});
                                } else if(!saved) {
                                    return res.status(400).send({ message: 'Error al guardar el producto'});
                                } else {
                                    return res.status(200).send({ data: saved});
                                }
                            })
                        } else {
                            return res.status(404).send({ message: 'No se ha podido crear la categoria.' });
                        }
                    });
                } else {
                    product.product_name = params.product_name
                    product.cuantity = params.cuantity
                    product.price = params.price
                    product.category = defaultFinded._id
                    product.sales = 0
                    product.save((err, saved) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error General'});
                        } else if(!saved) {
                            return res.status(400).send({ message: 'Error al guardar el producto'});
                        } else {
                            return res.status(200).send({ data: saved});
                        }
                    });
                }
            });
        }
    } else {
        return res.status(401).send({ message: 'No tiene los permisos necesarios'});
    }
}

function findProducts(req, res) {
    Product.find().populate({ path: 'category', select: 'category_name' }).exec((err, products) => {
        if(err) {
            return res.status(500).send({ message: 'Error General'});
        } else {
            return res.status(200).send({ data: products});
        }
    });
}

function findProductsByCategory(req, res) {
    var params = req.body;
    if(params.category_name) {
        Category.findOne({ category_name: params.category_name }).exec((err, categoryFinded) => {
            if(err) {
                return res.status(500).send({ message: 'Error General'});
            } else if(!categoryFinded){
                return res.status(404).send({ message: 'La Categoria que busca no existe'});
            } else {
                Product.find({ category: categoryFinded._id }).populate({ path: 'category', select: 'category_name' }).exec((err, products) => {
                    if(err) {
                        return res.status(500).send({ message: 'Error General'});
                    } else {
                        return res.status(200).send({ data: products});
                    }
                });
            }
        });
    } else if(params.category) {
        Product.find({ category: params.category }).populate({ path: 'category', select: 'category_name' }).exec((err, products) => {
            if(err) {
                return res.status(500).send({ message: 'Error General'});
            } else {
                return res.status(200).send({ data: products});
            }
        });
    } else {
        return res.status(400).send({ message: 'Debe de mandar el nombre o el id de la categoria'});
    }
}

function editProduct(req, res) {
    var params = req.body;
    var dataToUpdate = {};
    if(req.user.rol === 'ROLE_ADMIN') {
        if(params.id) {
            if(params.product_name) {
                dataToUpdate.product_name = params.product_name
            }
            if(params.cuantity) {
                dataToUpdate.cuantity = params.cuantity
            }
            if(params.price) {
                dataToUpdate.price = params.price
            }
            if(params.category) {
                dataToUpdate.category = params.category
            }
            if(Object.keys(dataToUpdate).length === 0) {
                return res.status(400).send({ message: 'No esta mandando ni un dato para actualizar'});
            } else {
                if(dataToUpdate.category) {
                    Category.findById(dataToUpdate.category).exec((err, category) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error General'});
                        } else if(!category) {
                            return res.status(400).send({ message: 'La categoria nueva que quiere actualizar no existe'});
                        } else {
                            Product.findByIdAndUpdate(params.id, dataToUpdate, { new: true }, (err, productUpdated) => {
                                if(err) {
                                    return res.status(500).send({ message: 'Error General'});
                                } else if(!productUpdated) {
                                    return res.status(404).send({ message: 'El producto que quiere actulizar no existe'});
                                } else {
                                    return res.status(200).send({ data: productUpdated});
                                }
                            });
                        }
                    });
                } else {
                    Product.findByIdAndUpdate(params.id, dataToUpdate, { new: true }, (err, productUpdated) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error General'});
                        } else if(!productUpdated) {
                            return res.status(404).send({ message: 'El producto que quiere actulizar no existe'});
                        } else {
                            return res.status(200).send({ data: productUpdated});
                        }
                    });
    
                }
            }
        } else {
            return res.status(400).send({ message: 'Debe proporcionar el id del producto que quiere actualizar'});
        }
    } else {
        return res.status(401).send({ message: 'No tiene los permisos necesarios'});
    }
}

function soldOutProducts(req, res) {
    Product.find({ cuantity: 0 }).populate('category').exec((err, soldOut) => {
        if(err) {
            return res.status(500).send({ message: 'Error General'});
        } else {
            return res.status(200).send({ data: soldOut});
        }
    });
}

function mostSalesProducts(req, res) {
    Product.find({}).populate('category').sort({ sales: -1 }).exec((err, mostSales) => {
        if(err) {
            return res.status(500).send({ message: 'Error General'});
        } else {
            return res.status(200).send({ data: mostSales});
        }
    });
}

function deleteProduct(req, res) {
    var params = req.body;
    if(req.user.rol === 'ROLE_ADMIN') {
        Product.findByIdAndDelete(params.id, (err, deleted) => {
            if(err) {
                return res.status(500).send({ message: 'Error General'});
            } else if(!deleted) {
                return res.status(404).send({ message: 'El producto que quiere eliminar no existe'});
            } else {
                return res.status(200).send({ data: 'producto eliminado',deleted});
            }
        });
    } else {
        return res.status(401).send({ message: 'No tiene los permisos necesarios'});
    }
}

module.exports = {
    createProduct,
    findProducts,
    findProductsByCategory,
    editProduct,
    deleteProduct,
    mostSalesProducts,
    soldOutProducts
}