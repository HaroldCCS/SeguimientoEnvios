'use strict'


import mongoose from 'mongoose';
const Schema = mongoose.Schema

const ProductSchema = Schema({
  name: String,
  brand: String,
  price: {type: Number},
  description: String,
  stock: {type: Number, default: 0},
  sell: {type: Number, default: 0},
  state: {type: Boolean, default: true},
  dataCreate: {type: Date, default: Date.now()},
})

module.exports = mongoose.model('Product', ProductSchema)