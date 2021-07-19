"use strict";

import Client from "../models/client";
import Bill from "../models/bill";
import response from '../util/response'
import Crud from '../util/Crud'
import { processValidationBodyJsonSchema } from '../validate-schema';

export default class ClientController{

  /**
	 * Funcion que permite Registrar un usuario Cliente
	 * @param {object} req
	 * @param {object} res
	*/
  static register(req, res){

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_clientRegister")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    try {
      const client = new Client({
        nit: req.body.nit,
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password
      })

      client.save((err, userSaved) => {
        if (err) return response(500, "R002", "Error to create user", "error", {}, res);
        return response(200, "R001", "User create successful", "success", {}, res);
      })
    } catch (error) {
      return response(500, "R002", "Error to create user", "error", {}, res);
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

    return Crud.signIn(Client, req.body, 2, res)
  }

  /**
	 * Funcion que permite obtener Todos los usuarios (solo para admin)
	 * @param {object} req
	 * @param {object} res
	*/
  static async getAll(req, res) {

    try {
      let value = await Promise.resolve(Crud.findAll(Client));
      return response(200, "R001", "Get clients", "success", value, res);
    } catch (error) {
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", "Clients not found", "success", {}, res);
    }
  }

  /**
	 * Funcion que permite ingresar sesion
	 * @param {object} req
	 * @param {object} res
	*/
  static async statistics(req, res){

    try {
      let dataBill = await Promise.resolve(Crud.findEspecific(Bill,{}, {"idClient": 1, "priceAll":1, "product":1}));
      let dataClient = await Promise.resolve(Crud.findEspecific(Client,{}, {"name": 1}));
      let countData = dataBill.reduce((a,d) => (a[d.idClient] ? a[d.idClient] += 1: a[d.idClient] = 1, a), []);

      let idClients= Object.keys(countData);

      let organizar = [];

      for (const i of idClients) {
        let clientName = dataClient.filter((a) => a._id == i);
        let clientdata = dataBill.filter((a) => a.idClient === i);
        let totalCompras = 0;
        let totalProducts = 0;
        for (const y of clientdata) {
          totalCompras += y.priceAll
          for (const x of y.product) totalProducts += x.quantity
        };
        organizar.push({id: i, name: clientName[0].name, frecuency: countData[i], pays: totalCompras, products: totalProducts})
      }

      let data = organizar.sort((a, b) => a.frecuency - b.frecuency ).reverse()

      return response(200, "R001", "Data for statistics", "success", {data}, res);
    } catch (error) {
      if(error == 400) return response(400, "R003", "No statistics", "success", {}, res);
			console.log(error)
      return response(500, "R002", "Internal Service Error", "error", {}, res);
    }
  }



}
