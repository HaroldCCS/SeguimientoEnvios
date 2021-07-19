"use strict";

//modelo
import Bill from '../models/bill'
import Client from '../models/client'
import User from '../models/user'
import Product from '../models/product'
import ProductController from './Product'
import response from '../util/response'
import Crud from '../util/Crud'
import { processValidationBodyJsonSchema } from '../validate-schema';

export default class BillController {

  /**
	 * Funcion que permite obtener guardar un pedido/factura
	 * @param {object} req
	 * @param {object} res
	*/
  static async save(req, res) {

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_billRegister")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    let bill = new Bill();
    bill.idClient = req.body.idClient;
    bill.direction = req.body.direction;
    bill.city = req.body.city;
    bill.phone = req.body.phone;
    bill.state = [{id: 1, date: Date.now()}]

    let data = {
      _id: "",
      client: {
        id: bill.idClient,
        nit: "",
        name: "",
        email: "",
        phone: ""
      },
      products: req.body.product,
      state: {
        name: BillController.statesBill(1),
        date: (new Date(Date.now())).toString()
      },
      phoneContact: req.body.phone,
      direction: bill.direction,
      city: bill.city,
      priceAll: 0
    }
    let nameLog = "Client not exists";
    try {
      let clientData = await Promise.resolve( Crud.findOne(Client, {_id: bill.idClient}));
      data.client.nit = clientData.nit;
      data.client.name = clientData.name;
      data.client.email = clientData.email;
      data.client.phone = clientData.phone;

      nameLog = "Product not exists";

      let updateProducts = []
      for (const i of data.products) {
        console.log(i)
        let productData = await Promise.resolve( Crud.findOne(Product, {_id: i.id}));
        console.log(`Product: ${i.id} exists`)
        let validateProduct = await Promise.resolve(BillController.validataProducts(productData, i.quantity));
        console.log(`Product: ${i.id} pass validations`)
        i.name = productData.name
        i.price = productData.price
        i.totalPrice = i.quantity * productData.price
        data.priceAll = data.priceAll + i.totalPrice;
        updateProducts.push([i.id, validateProduct.sell, validateProduct.stock] )
      }

      for (const i of updateProducts) {
       await Promise.resolve(ProductController.changeStock(...i));
      }

    } catch (error) {
      console.error(error)
      if(error == 400) return response(400, "R003", `${nameLog}`, "success", {}, res);
      if(error.status == 400) return response(400, "R003", `${error.nameLog}`, "success", {}, res);
      return response(500, "R002", "Internal Service Error", "error", {}, res);
    }
    bill.product = data.products;
    bill.priceAll = data.priceAll;
    bill.save((err, billStored) => {
      if (err) return response(500, "R002", "Error to save bill", "error", {err}, res);

      data._id = billStored._id;
      return response(200, "R001", "create bill successful", "success", {bill: data}, res);

    });
  }

  /**
	 * Funcion que permite obtener UN  pedido/factura
	 * @param {object} req
	 * @param {object} res
	*/
  static async getOne(req, res) {
    let billId = req.params.billId;

    let data = {
      _id: billId,
      client: {
        id: "",
        nit: "",
        name: "",
        email: "",
        phone: ""
      },
      products: "",
      state: [],
      phoneContact: "",
      direction: "",
      city: "",
      priceAll: 0
    }

    let nameError = "Bill";
    try {
      let dataBill = await Promise.resolve(Crud.findOne(Bill, {_id: billId}));
      data.products = dataBill.product
      data.phoneContact = dataBill.phone
      data.direction = dataBill.direction
      data.city = dataBill.city
      data.priceAll = dataBill.priceAll

      nameError = "Client";
      let dataClient = await Promise.resolve( Crud.findOne(Client, {_id: dataBill.idClient}));
      data.client.id = dataClient._id;
      data.client.nit = dataClient.nit;
      data.client.name = dataClient.name;
      data.client.email = dataClient.email;
      data.client.phone = dataClient.phone;

      nameError = "Operator";
      for (const i of dataBill.state) {
        if(typeof i.operator == "string"){
          let dataOperator = await Promise.resolve(Crud.findOne(User, {_id: i.operator}));
          i.operatorName = dataOperator.name
        }
        i.state = BillController.statesBill(i.id)
        i.date = (new Date(i.date)).toString()
      }
      data.state = dataBill.state
      return response(200, "R001", "Get bill", "success", data, res);
    } catch (error) {
      console.log(error)
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", `${nameError} not found`, "success", {}, res);
    }

  }

  /**
	 * Funcion que permite obtener Todos los pedidos/facturas
	 * @param {object} req
	 * @param {object} res
	*/
  static async getAll(req, res) {

    try {
      let value = await Promise.resolve(Crud.findAll(Bill));
      return response(200, "R001", "Get bills", "success", {bills: value}, res);
    } catch (error) {
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", "Bills not found", "success", {}, res);
    }
  }

  /**
	 * Funcion que permite editar un pedido/factura
	 * @param {object} req
	 * @param {object} res
	*/
  static update(req, res) {

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_billUpdate")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    let billId = req.params.billId;
    let update = req.body;

    Bill.findByIdAndUpdate(billId, update, (err, billUpdated) => {
      if (err) return response(500, "R002", "Error to update bill", "error", {}, res);
      if (!billUpdated) return response(404, "R003", "Bill not found", "success", {}, res);

      return response(200, "R001", "bill modfify", "success", {bill: billUpdated}, res);
    });
  }

  /**
	 * Funcion que permite cambiar el estado de un pedido
	 * @param {object} req
	 * @param {object} res
	*/
  static async state(req, res) {

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_billState")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    let billId = req.params.billId;
    let stateId = req.body.state;
    let operatorId = req.body.operatorId;

    let nameError = "Bill";
    let newState = {state: []};
    let dataReturn = { state: '', operator: '', date: (new Date(Date.now())).toDateString() };
    if(stateId < 2 || stateId > 4) return response(400, "R003", "State error", "success", {}, res);

    try {
      let dataBill = await Promise.resolve(Crud.findOne(Bill, {_id: billId}));
      let stateLength = dataBill.state.length

      if(stateId <= stateLength) return response(400, "R003", "State error", "success", {}, res);
      if(stateLength + 1 == stateId){
        dataReturn.state = BillController.statesBill(stateId);
      }else{
        return response(400, "R003", "State error", "success", {}, res);
      }
      nameError = "Operator";
      let dataOperator = await Promise.resolve(Crud.findOne(User, {_id: operatorId}));
      dataReturn.operator = dataOperator.name;
      newState.state.push(...dataBill.state)
      newState.state.push({id: stateId, operator: operatorId, date: Date.now() })

    } catch (error) {
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", `${nameError} not found`, "success", {}, res);
    }

    Bill.findByIdAndUpdate(billId, newState, (err, billUpdated) => {
      if (err) return response(500, "R002", "Error to update steate", "error", {}, res);
      if (!billUpdated) return response(404, "R003", "Bill not found", "success", {}, res);

      return response(200, "R001", "State modfify sucessful", "success", {newState: dataReturn}, res);
    });
  }

  /**
	 * Funcion que permite cambiar el estado de un pedido
	 * @param {object} req
	 * @param {object} res
	*/
  static async calificate(req, res) {

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_billCalificate")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    let billId = req.params.billId;
    let bodyCalificates = req.body.data;

    let newProduct = {product: []};
    let nameError = "Bill not found";
    try {
      let dataBill = await Promise.resolve(Crud.findOne(Bill, {_id: billId}));

      nameError = "Status bill not accept"
      if(dataBill.state.length != 4) return response(400, "R003", `${nameError}`, "success", {}, res);
      newProduct.product = dataBill.product

      for (let i of newProduct.product) {
        let filtro = bodyCalificates.filter((a) => a.id == i.id);
        if (filtro.length == 0) {
          console.log('sin calificaicon')
        } else {
          i.calificate = filtro[0].calificate
        }
      }

    } catch (error) {
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", `${nameError}`, "success", {}, res);
    }

    Bill.findByIdAndUpdate(billId, newProduct, (err, billUpdated) => {
      if (err) return response(500, "R002", "Error to update calification", "error", {}, res);
      if (!billUpdated) return response(404, "R003", "Bill not found", "success", {}, res);

      return response(200, "R001", "Calification sucessful", "success", {}, res);
    });
  }

  /**
	 * Funcion que permite validar el stock y estado de un producto
	 * @param {Object} product
	 * @param {Number} quantity
	*/
  static validataProducts(product, quantity){
    return new Promise((resolve, reject) => {
      let stock = product.stock - quantity
      if(stock < 0){
        reject({status: 400, nameLog: `Product '${product.name}' no have Stock`})
      }
      console.log(`state: ${product.state}`)
      if(!product.state){
        reject({status: 400, nameLog: `Product ${product.name} disable`})
      }

      resolve ({stock: stock, sell: product.sell + quantity })

    })
  }

  /**
	 * Funcion que permite consultar los estados de pedido segun id
	 * @param {string} id
	*/
  static statesBill(id){
    switch (id) {
      case 1:
        return "Pending"
      case 2:
        return "In progress"
      case 3:
        return "Sending"
      case 4:
        return "delivered"

    }
  }
}
