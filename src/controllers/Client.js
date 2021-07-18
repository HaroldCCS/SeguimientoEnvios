"use strict";

import Client from "../models/client";
import services from '../services';


export default class ClientController{
  static register(req, res){
    const client = new Client({
      nit: req.body.nit,
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
      password: req.body.password
    })


    client.save(err => {
      if (err) return res.status(500).send({ msg: `Error al crear usuario: ${err}` })
      return res.status(200).send({ message: "Client create successful" })
    })
  }

  static signIn(req, res){

    Client.findOne({ email: req.body.email, password: req.body.password }, (err, client) => {
      if(err) {
          res.status(500).json({
              error: 'Server error'
          });
      }
      if(!client) {
          res.status(400).json({
              message: 'Client not found'
          });
      }
      let token = services.createToken(client, 3)
      res.status(200).send({
        message: 'Te has logueado correctamente',
        token: token
      })
    });

  }
}
