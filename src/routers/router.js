'use strict'

import express from 'express';
import Product from '../controllers/Product'
import User from '../controllers/User';
import Client from '../controllers/Client';
import auth from '../middlewares/auth';
const api = express.Router()

//products
api.get('/product', Product.getAll)
api.get('/product/:productId', Product.getOne)
api.post('/product', auth,Product.save)
api.put('/product/:productId', auth,Product.update )
api.delete('/product/:productId', auth,Product.delete)

//staff
api.post('/user/register', User.register)
api.post('/user/signin', User.signIn)

//clients
api.post('/client/signup', Client.register)
api.post('/client/signin', Client.signIn)



//bills




api.get('/private', auth, function (req, res) {
  res.status(200).send({message: 'Tienes acceso'})
})

module.exports = api