"use strict";

//modelo
import Bill from '../models/bill'
import Client from '../models/client'
import User from '../models/user'
import Product from '../models/product'
import ProductController from './Product'
import response from '../util/response'
import Crud from '../util/Crud'

export default class BillController {

  static async save(req, res) {
    console.log(req.body)
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
        date: (new Date(Date.now())).toDateString()
      },
      phoneContact: req.body.phonem,
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

  static async getOne(req, res) {
    console.log('entre aqui')
    try {
      let value = await Promise.resolve(Crud.findOne(Bill, {_id: req.params.billId}));
      return response(200, "R001", "Get bill", "success", {bill: value}, res);
    } catch (error) {
      console.log(error)
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", "Bill not found", "success", {}, res);
    }

  }

  static async getAll(req, res) {

    try {
      let value = await Promise.resolve(Crud.findAll(Bill));
      return response(200, "R001", "Get bills", "success", {bills: value}, res);
    } catch (error) {
      if(error == 500) return response(500, "R002", "Internal Service Error", "error", {}, res);
      if(error == 400) return response(400, "R003", "Bills not found", "success", {}, res);
    }
  }

  static update(req, res) {
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

  static addSell(billId, sell, stock) {

    Bill.findByIdAndUpdate(billId, {sell: sell, stock: stock }, (err, billUpdated) => {
      if (err) return false
      if (billUpdated == null) return false

      return true
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
	 * @param {Number} id
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

      default:
        return 500
    }
  }
}
