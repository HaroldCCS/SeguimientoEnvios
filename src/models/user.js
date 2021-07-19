'use strict'


import mongoose from 'mongoose';
//import bcrypt from 'bcrypt-nodejs';
const Schema = mongoose.Schema

const UserSchema = Schema({
  nit: {type: Number, unique: true, lowercase: true},
  email: {type: String, unique: true, lowercase: true},
  name: String,
  phone: {type: String, unique: true, size: 15},
  typeAccess: {type: Number},
  password: {type: String, select: false},
  signupDate: {type: Date, default: Date.now()},
  lastLogin: Date
})

//funcion quue se ejecuta antes de guardar el Schema (antes de una insercion)
/*UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err)

    bcrypt.hash(this.password, salt, null, (errr, hash) => {
      if (errr) return next(errr)
      this.password = hash
      console.log(this.password)
      next()
    })
  })
})*/


module.exports = mongoose.model('User', UserSchema)