"use strict";

//modelo
import Bill from '../models/bill'

import response from '../util/resposne'

export default class BillController {

  static save(req, res) {
    let bill = new Bill();
    bill.idClient = req.body.idClient;
    bill.product = req.body.product;
    bill.direction = req.body.direction;
    bill.priceAll = 0;


    bill.save((err, billStored) => {
      if (err) response(500, "R002", "Error to save bill", "error", {}, res);

      return response(200, "R001", "create bill successful", "success", {bill: billStored}, res);

    });
  }

  static getOne(req, res) {
    let billId = req.params.billId;

    Bill.findById(billId, (err, bill) => {
      if (err) response(500, "R002", "Error to get bill", "error", {}, res);
      if (!bill) response(404, "R003", "Bill not found", "success", {}, res);

      return response(200,"R001", "get bill", "success", {bill: bill}, res);
    });
  }

  static getAll(req, res) {
    Bill.find((err, bills) => {

      if (err) response(500, "R002", "Error to get bill", "error", {}, res);
      if (!bill) response(404, "R003", "Bills not found", "success", {}, res);

      return response(200, "R001", "Get all bills", "success", {bills: bills}, res);
    });
  }

  static update(req, res) {
    let billId = req.params.billId;
    let update = req.body;

    Bill.findByIdAndUpdate(billId, update, (err, billUpdated) => {
      if (err) response(500, "R002", "Error to update bill", "error", {}, res);
      if (!billUpdated) response(404, "R003", "Bill not found", "success", {}, res);

      return response(200, "R001", "bill modfify", "success", {bill: billUpdated}, res);
    });
  }

  static delete(req, res) {
    let billId = req.params.billId;

    Bill.findById(billId, (err, bill) => {
      if (err) response(500, "R002", "Error to delete bill", "error", {}, res);

      bill.remove((error) => {
        if (error) response(500, "R002", "Error to delete bill", "error", {}, res);

        return response(200, "R001", "bill removed", "success", {}, res);
      });
    });
  }

  static addSell(billId, sell, stock) {

    Bill.findByIdAndUpdate(billId, {sell: sell, stock: stock }, (err, billUpdated) => {
      if (err) return false
      if (billUpdated == null) return false

      return true
    });
  }
}
