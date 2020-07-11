'use strict'
const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user.model");
const jwt = require('../services/jwt');
const Cart = require('../models/cart.model');

function register(req, res) {
    var user = new User();
    var params = req.body;

    if (params.username && params.password && params.email) {
        user.username = params.username
        user.email = params.email
        if(params.rol) {
            user.rol = params.rol
        } else {
            user.rol = 'ROLE_CLIENTE'
        }
        User.find({ $or: [{ username: user.username }, { email: user.email }] }).exec((err, users) => {
            if(err) return res.status(500).send({ message: 'Error en la peticion de usuario.' });
            if(users && users.length >= 1) {
                return res.status(500).send({ message: ' Usuario ya existente' });
            } else {
                bcrypt.hash(params.password, null, null, (err, hash) => {
                    user.password = hash
                    user.save((err, usuarioGuardado) => {
                        if(err) return res.status(500).send({ message: 'Error general' });
                        if(usuarioGuardado) {
                            var cart = new Cart();
                            cart.owner = usuarioGuardado._id
                            cart.products = []
                            cart.save((err, saved) => {
                                if(err) {
                                    return res.status(500).send({ message: 'Error general' });
                                } else if(!saved) {
                                    return res.status(400).send({ message: 'El carrito del usuario no se ha podido crear' });
                                }
                            })
                            return res.status(200).send({ data: usuarioGuardado });
                        } else {
                            return res.status(404).send({ message: 'No se ha podido registrar al usuario.' });
                        }
                    });
                });
            }  
        });
    } else {
        return res.status(200).send({ message: 'Rellene todos los datos necesarios.'});
    }
}

function login(req, res) {
    var params = req.body;
    User.findOne({ email: params.email }, (err, usuario) => {
        if(err) return res.status(500).send({ message: 'Error en la peticion' });
        if(usuario) {
            bcrypt.compare(params.password, usuario.password, (err, check) => {
                if(check) {
                    if(params.gettoken) {
                        return res.status(200).send({ token: jwt.createToken(usuario) });
                    } else {
                        usuario.password = undefined
                        return res.status(200).send({ user: usuario });
                    }
                } else {
                    return res.status(404).send({ message: 'El usuario no se ha podido identificar.' });
                }
            });
        } else {
            return res.status(404).send({ message: 'El usuario no se ha podido logear' });
        }
    });
}

function editUser(req, res) {
    var params = req.body;
    
    if(req.user.rol === 'ROLE_ADMIN' && params.userId) {
        User.findById(params.userId).exec((err, user) => {
            if(err) return res.status(500).send({ message: 'Error en la peticion' });
            if(!user) return res.status(404).send({ message: 'No se ha podido encontrar el usuario' });
            if(user.rol === 'ROLE_ADMIN') {
                return res.status(400).send({ message: 'No puedes modificar un administrador' });
            } else {
                User.findByIdAndUpdate(params.userId, params, { new: true }, (error, usuarioActualizado) => {
                    if(error) return res.status(500).send({ message: 'Error en la peticion' });
                    if(!usuarioActualizado) return res.status(404).send({ message: 'No se ha podido editar el usuario' });
                    return res.status(200).send({ user: usuarioActualizado });
                });
            }
        });
    } else {
        User.findByIdAndUpdate(req.user.sub, params, { new: true}, (error, usuarioActualizado) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            if(!usuarioActualizado) return res.status(404).send({ message: 'No se ha podido editar el usuario' });
            return res.status(200).send({ user: usuarioActualizado });
        });
    }
}

function deleteUser (req, res) {
    const params = req.body;
    if(req.user.rol === 'ROLE_ADMIN' && params.userId) {
        User.findById(params.userId).exec((err, user) => {
            if(err) return res.status(500).send({ message: 'Error en la peticion' });
            if(!user) return res.status(404).send({ message: 'No se ha podido encontrar el usuario' });
            if(user.rol === 'ROLE_ADMIN') {
                return res.status(400).send({ message: 'No puedes eliminar un administrador' });
            } else {
                User.findByIdAndDelete(params.userId, (error, userDeleted) => {
                    if(error) return res.status(500).send({ message: 'Error en la peticion' });
                    return res.status(200).send({ message: 'Usuario Eliminado', usuarioEliminado: userDeleted });
                });
            }
        });
    } else {
        User.findByIdAndDelete(req.user.sub, (error, userDeleted) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            return res.status(200).send({ message: 'Has Eliminado tu cuenta', usuarioEliminado: userDeleted });
        });
    }
}

function getUsers(req, res) {
    if(req.user.rol === 'ROLE_CLIENTE') {
        User.find({rol: 'ROLE_CLIENTE'}).exec((error, users) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            return res.status(200).send({ users: users });
        });
    } else {
        User.find().exec((error, users) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            return res.status(200).send({ users: users });
        });
    }
}

function getUserById(req, res) {
    const params = req.body;
    if(req.user.rol === 'ROLE_ADMIN') {
        User.findById(params.userId, (error, user) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            return res.status(200).send({ user: user });
        });
    } else {
        User.findOne({ rol: 'ROLE_CLIENTE', _id: params.userId }, (error, user) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            if(!user) return res.status(404).send({ message: 'No se ha encontrado un usuario o intentas buscar a un administrador y no lo tienes permitido' });
            return res.status(200).send({ user: user });
        });
    }
    
}

function getUsersByName(req, res) {
    const params = req.body;
    if(req.user.rol === 'ROLE_ADMIN') {
        User.find({ username: { $regex: `.*${ params.name }.*`, $options: 'si' } }, (error, users) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            return res.status(200).send({ users: users });
        });
    } else {
        User.find({ username: { $regex: `.*${ params.name }.*`, $options: 'si' }, rol: 'ROLE_CLIENTE' }, (error, users) => {
            if(error) return res.status(500).send({ message: 'Error en la peticion' });
            return res.status(200).send({ users: users });
        });
    }
}

module.exports = {
    register,
    login,
    editUser,
    deleteUser,
    getUsers,
    getUserById,
    getUsersByName
}