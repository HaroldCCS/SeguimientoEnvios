'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema

const BillSchema = Schema({
  idClient: {type: String},
  product: {type: Object},
  direction: {type: String},
  city: {type: String},
  phone: {type: String, unique: true, size: 15},
  priceAll: {type: Number},
  state: {type: Number, default: 1}
})

module.exports = mongoose.model('Bill', BillSchema)