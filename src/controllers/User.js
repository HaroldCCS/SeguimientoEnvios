"use strict";

import User from "../models/user";
import services from '../services';


export default class UserController{
  static register(req, res){
    const user = new User({
      nit: req.body.nit,
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
      password: req.body.password
    })


    user.save(err => {
      if (err) return res.status(500).send({ msg: `Error al crear usuario: ${err}` })
      return res.status(200).send({ message: "User create successful" })
    })
  }

  static signIn(req, res){

    User.findOne({ email: req.body.email, password: req.body.password }, (err, user) => {
      if(err) {
          res.status(500).json({
              error: 'Server error'
          });
      }
      if(!user) {
          res.status(400).json({
              message: 'User not found'
          });
      }
      let token = services.createToken(user, user.typeAccess)
      res.status(200).send({
        message: 'Te has logueado correctamente',
        token: token
      })
    });

  }
}
