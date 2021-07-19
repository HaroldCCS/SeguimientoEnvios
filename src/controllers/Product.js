"use strict";

//modelo
import Product from '../models/product'
import Bill from '../models/bill'
import response from '../util/response'
import Crud from '../util/Crud'
import { processValidationBodyJsonSchema } from '../validate-schema';

export default class ProductController {

  static save(req, res) {

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_productRegister")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }


    let product = new Product();
    product.name = req.body.name;
    product.brand = req.body.brand;
    product.price = req.body.price;
    product.description = req.body.description;
    product.stock = req.body.stock;

    product.save((err, productStored) => {
      if (err) return response(500, "R002", "Error to save product", "error", {}, res);

      return response(200, "R001", "create product successful", "success", {product: productStored}, res);

    });
  }

  static getOne(req, res) {
    let productId = req.params.productId;

    Product.findById(productId, (err, product) => {
      if (err) return response(500, "R002", "Error to get product", "error", {}, res);
      if (!product) return response(404, "R003", "Product not found", "success", {}, res);

      return response(200,"R001", "Get product", "success", {product: product}, res);
    });
  }

  static async getAll(req, res) {

    try {
      let value = await Promise.resolve(Crud.findAll(Product));
      return response(200, "R001", "Get products", "success", {products: value}, res);
    } catch (error) {
      if(error == 400) return response(400, "R003", "Products not found", "success", {}, res);
      console.log(error)
      return response(500, "R002", "Internal Service Error", "error", {}, res);
    }
  }

  static update(req, res) {

    let dataValidation = processValidationBodyJsonSchema(req.body, "schema_productUpdate")
    if (dataValidation.status){
        console.error(dataValidation.messageError);
        return response(500, dataValidation.response.code, dataValidation.response.message, dataValidation.response.type, {}, res);
    }

    let productId = req.params.productId;
    let update = req.body;

    Product.findByIdAndUpdate(productId, update, (err, productUpdated) => {
      if (err) return response(500, "R002", "Error to update product", "error", {}, res);
      if (!productUpdated) return response(404, "R003", "Product not found", "success", {}, res);

      return response(200, "R001", "Product modfify", "success", {}, res);
    });
  }

  static delete(req, res) {
    let productId = req.params.productId;
    Product.findById(productId, (err, product) => {
      if (err) return response(500, "R002", "Error to delete product", "error", {}, res);
      if (!product) return response(500, "R003", "Product not found", "success", {}, res);
      product.remove((error) => {
        if (error) return response(500, "R002", "Error to delete product", "error", {}, res);

        return response(200, "R001", "product removed", "success", {}, res);
      });
    });
  }

  /**
	 * Funcion que permite ingresar sesion
	 * @param {object} req
	 * @param {object} res
	*/
  static async statistics(req, res){

    let dataReturn = []

    try {
      let dataBill = await Promise.resolve(Crud.findEspecific(Bill,{}, {"product":1, "state":1}));

      let filterStateBill = dataBill.filter(a => a.state.length == 4 );

      let productData = await Promise.resolve( Crud.findAll(Product));

      for (let i of productData) {
        let arr = []
        for (const x of filterStateBill) {
          for (const y of x.product) {
            if (y.id == i._id && y.calificate)arr.push(y.calificate)
          }
        }
        let valor = 0;
        let cantidadCalifications = arr.length;
        if(cantidadCalifications != 0){
          for (const t of arr) {
            valor += t
          }
          valor = valor / cantidadCalifications
        }

        dataReturn.push({
          id: i._id,
          name: i.name,
          brand: i.brand,
          stock: i.stock,
          sell:  i.sell,
          price: i.price,
          generalCalification: valor,
          amountCalification: cantidadCalifications
        })
      }
      dataReturn = dataReturn.sort((a, b) => a.generalCalification - b.generalCalification ).reverse()

      return response(200, "R001", "Data for statistics", "success", dataReturn, res);

    } catch (error) {
      if(error == 400) return response(400, "R003", "No statistics", "success", {}, res);
			console.log(error)
      return response(500, "R002", "Internal Service Error", "error", {}, res);
    }
  }

  static changeStock(productId, sell, stock) {
    return new Promise((resolve, reject) => {
      Product.findByIdAndUpdate(productId, {sell: sell, stock: stock }, (err, productUpdated) => {
        if (err) return reject(500)
        if (productUpdated == null) return reject(500)

        return resolve()
      });
    })
  }
}
