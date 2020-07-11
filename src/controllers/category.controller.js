'use strict'
const Category = require('../models/category.model');
const Product = require('../models/product.model');

function createCategory(req, res) {
    if(req.user.rol === 'ROLE_ADMIN') {
        var params = req.body;
        var category = new Category();
        if(params.category_name) {
            Category.findOne({ category_name: { $regex: `.*${params.category_name}.*`, $options: 'si' } }).exec((err, categoryFinded) => {
                if(err) {
                    return res.status(500).send({ message: 'Error General'});
                }else if(categoryFinded) {
                    return res.status(200).send({ message: 'Categoria Existente' });
                } else {
                    category.category_name = params.category_name
                    category.save((err, categorySaved) => {
                        if(err) return res.status(500).send({ message: 'Error general.' });
                        if(categorySaved) {
                            return res.status(200).send({ data: categorySaved });
                        } else {
                            return res.status(404).send({ message: 'No se ha podido crear la categoria.' });
                        }
                    });
                }
            });
        } else {
            return res.status(400).send({ message: 'Rellene todos los campos necesarios'});
        }
    } else {
        return res.status(401).send({ message: 'No tiene los permisos necesarios'});
    }
}

function findCategories(req, res) {
    Category.find().exec((err, categorias) => {
        if(err) {
            return res.status(500).send({ message: 'Error General'});
        } else {
            return res.status(200).send({ message: categorias});
        }
    });
}

function editCategory(req, res) {
    var params = req.body;
    if(req.user.rol === 'ROLE_ADMIN') {
        if(params.category && params.category_name) {
            Category.findByIdAndUpdate(params.category, { category_name: params.category_name }, { new: true }, (err, categoryUpdated) => {
                if(err) {
                    return res.status(500).send({ message: 'Error al general' });
                }
                if(!categoryUpdated) {
                    return res.status(200).send({ message: 'Error al actualizar' });
                } else {
                    return res.status(200).send({ data: categoryUpdated });
                }
            });
        } else {
            return res.status(400).send({ message: 'Rellene todos los campos necesarios'});
        }
    } else {
        return res.status(401).send({ message: 'No tiene los permisos necesarios'});
    }
}

function deleteCategory(req, res) {
    var params = req.body;
    if(req.user.rol === 'ROLE_ADMIN') {
        if(params.id) {
            Category.findById(params.id, (err, finded) => {
                if(err) {
                    return res.status(500).send({ message: 'Error general'});
                } else if(!finded) {
                    return res.status(404).send({ message: 'No se ha encontrado'});
                } else if(finded.category_name === 'default') {
                    return res.status(401).send({ message: 'No se puede eliminar la categoria por default.' });
                } else {
                    Category.findOne({ category_name: 'default'},(err, defaultFinded) => {
                        if(err) {
                            return res.status(500).send({ message: 'Error general'});
                        } else if(!defaultFinded){
                            var category = new Category();
                            category.category_name = 'default'
                            category.save((err, saved) => {
                                if(err) {
                                    return res.status(500).send({ message: 'Error general'});
                                } else if(!saved){
                                    return res.status(400).send({ message: 'No se ha podido guardar la default'});
                                } else {
                                    Product.updateMany({ category: params.id }, { category: saved._id }, (err, products) => {
                                        if(err) {
                                            return res.status(500).send({ message: 'Error general'});
                                        } else {
                                            Category.findByIdAndDelete(params.id, (err, deleted) => {
                                                if(err) {
                                                    return res.status(500).send({ message: 'Error general'});
                                                } else if(!deleted){
                                                    return res.status(400).send({ message: 'No se ha podido eliminar'});
                                                } else {
                                                    return res.status(200).send({ data: 'categoria eliminada', deleted}); 
                                                }
                                            });
                                        } 
                                    });
                                }
                            });
                        } else {
                            Product.updateMany({ category: params.id }, { category: defaultFinded._id }, (err, products) => {
                                if(err) {
                                    return res.status(500).send({ message: 'Error general'});
                                } else {
                                    Category.findByIdAndDelete(params.id, (err, deleted) => {
                                        if(err) {
                                            return res.status(500).send({ message: 'Error general'});
                                        } else if(!deleted){
                                            return res.status(400).send({ message: 'No se ha podido eliminar'});
                                        } else {
                                            return res.status(200).send({ data: deleted});  
                                        }
                                    });
                                } 
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(400).send({ message: 'Necesita proporcionar un id'});
        }
    } else {
        return res.status(401).send({ message: 'No tiene los permisos necesarios'});
    }
}

module.exports = {
    createCategory,
    findCategories,
    editCategory,
    deleteCategory
}