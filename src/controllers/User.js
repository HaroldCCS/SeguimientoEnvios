"use strict";

import User from "../models/user";
import response from '../util/response'
import Crud from '../util/Crud'

export default class UserController{

  /**
	 * Funcion que permite Registrar un usuario Staff
	 * @param {object} req
	 * @param {object} res
	*/
  static register(req, res){
    const user = new User({
      nit: req.body.nit,
      email: req.body.email,
      name: req.body.name,
      typeAccess: req.body.typeAccess,
      phone: req.body.phone,
      password: req.body.password
    })

    user.save(err => {
      if (err) response(500, "R002", "Error to create user", "error", {}, res);
      return response(200, "R001", "User create successful", "success", {}, res);

    })
  }

  /**
	 * Funcion que permite ingresar sesion
	 * @param {object} req
	 * @param {object} res
	*/
  static async signIn(req, res){
    return Crud.signIn(User, req.body, 0, res)
  }
}
