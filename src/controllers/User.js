"use strict";

import User from "../models/user";
import response from '../util/response'
import Crud from '../util/Crud'
import { processValidationBodyJsonSchema } from '../validate-schema';
export default class UserController{

  /**
	 * Funcion que permite Registrar un usuario Staff
	 * @param {object} req
	 * @param {object} res
	*/
  static register(req, res){

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_userRegister")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    const user = new User({
      nit: req.body.nit,
      email: req.body.email,
      name: req.body.name,
      typeAccess: req.body.typeAccess,
      phone: req.body.phone,
      password: req.body.password
    })

    user.save(err => {
      if (err) return response(500, "R002", "Error to create user", "error", {}, res);
      return response(200, "R001", "User create successful", "success", {}, res);

    })
  }

  /**
	 * Funcion que permite obtener Todos los usuarios (solo para admin)
	 * @param {object} req
	 * @param {object} res
	*/
  static async getAll(req, res) {

    try {
      let value = await Promise.resolve(Crud.findAll(User));
      return response(200, "R001", "Get staff", "success", value, res);
    } catch (error) {
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", "staff not found", "success", {}, res);
    }
  }

  /**
	 * Funcion que permite ingresar sesion
	 * @param {object} req
	 * @param {object} res
	*/
  static async signIn(req, res){
    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_userLogin")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    return Crud.signIn(User, req.body, 0, res)
  }
}
