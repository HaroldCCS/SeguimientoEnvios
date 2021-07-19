'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema

const BillSchema = Schema({
  idClient: {type: String},
  product: {type: Array},
  direction: {type: String},
  city: {type: String},
  phone: {type: String, size: 15},
  priceAll: {type: Number},
  state: {type: Array}
})

module.exports = mongoose.model('Bill', BillSchema)