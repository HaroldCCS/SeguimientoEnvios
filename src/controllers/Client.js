"use strict";

import Client from "../models/client";
import Bill from "../models/bill";
import response from '../util/response'
import Crud from '../util/Crud'


export default class ClientController{

  /**
	 * Funcion que permite Registrar un usuario Cliente
	 * @param {object} req
	 * @param {object} res
	*/
  static register(req, res){

    try {
      const client = new Client({
        nit: req.body.nit,
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        password: req.body.password
      })
  
      client.save(err => {
        if (err) response(500, "R002", "Error to create user", "error", {}, res);
        return response(200, "R001", "User create successful", "success", {}, res);
      })
    } catch (error) {
      console.error(error)
      response(500, "R002", "Error to create user", "error", {}, res);
    }

  }

  /**
	 * Funcion que permite ingresar sesion
	 * @param {object} req
	 * @param {object} res
	*/
  static async signIn(req, res){
    return Crud.signIn(Client, req.body, 2, res)
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

      for (let i = 0; i < idClients.length; i++) {
        let clientName = dataClient.filter((a) => a._id == idClients[i]);
        let clientdata = dataBill.filter((a) => a.idClient === idClients[i]);
        let totalCompras = 0;
        let totalProducts = 0;
        for (const i of clientdata) {
          totalCompras += i.priceAll
          for (const x of i.product) totalProducts += x.quantity
        };
        organizar.push({id: idClients[i], name: clientName[0].name, frecuency: countData[idClients[i]], pays: totalCompras, products: totalProducts})
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
