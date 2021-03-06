'use strict'

import express from 'express';
import Product from '../controllers/Product'
import User from '../controllers/User';
import Client from '../controllers/Client';
import Bill from '../controllers/Bill';
import Auth from '../middlewares/Auth';
const api = express.Router()

//products
api.get('/product', Product.getAll)
api.get('/product/statistics', Auth.admin, Product.statistics)
api.get('/product/:productId', Product.getOne)
api.post('/product', Auth.staff,Product.save)
api.put('/product/:productId', Auth.staff,Product.update )
api.delete('/product/:productId', Auth.staff,Product.delete)

//staff
api.post('/user/register', Auth.admin, User.register)
api.post('/user/signin', User.signIn)
api.get('/user', Auth.admin, User.getAll)

//clients
api.post('/client/signup', Client.register)
api.post('/client/signin', Client.signIn)
api.get('/client/statistics', Auth.admin, Client.statistics)
api.get('/client', Auth.staff, Client.getAll)

//bills
api.get('/bill', Auth.client, Bill.getAll)
api.get('/bill/:billId', Auth.client, Bill.getOne)
api.post('/bill', Auth.client ,Bill.save)
api.put('/bill:billId', Auth.admin, Bill.update)
api.put('/bill/state/:billId', Auth.staff, Bill.state)
api.put('/bill/calificate/:billId', Auth.client, Bill.calificate)


api.get('/private', function (req, res) {
  res.status(200).send({message: 'Servicio funcionando'})
})

module.exports = api