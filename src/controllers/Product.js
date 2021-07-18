"use strict";

//modelo
import Product from '../models/product'

import response from '../util/resposne'

export default class ProductController {

  static save(req, res) {
    let product = new Product();
    product.name = req.body.name;
    product.brand = req.body.brand;
    product.price = req.body.price;
    product.description = req.body.description;
    product.stock = req.body.stock;

    product.save((err, productStored) => {
      if (err) response(500, "R002", "Error to save product", "error", {}, res);

      return response(200, "R001", "create product successful", "success", {product: productStored}, res);

    });
  }

  static getOne(req, res) {
    let productId = req.params.productId;

    Product.findById(productId, (err, product) => {
      if (err) response(500, "R002", "Error to get product", "error", {}, res);
      if (!product) response(404, "R003", "Product not found", "success", {}, res);

      return response(200,"R001", "get product", "success", {product: product}, res);
    });
  }

  static getAll(req, res) {
    Product.find((err, products) => {

      if (err) response(500, "R002", "Error to get product", "error", {}, res);
      if (!product) response(404, "R003", "Products not found", "success", {}, res);

      return response(200, "R001", "Get all products", "success", {products: products}, res);
    });
  }

  static update(req, res) {
    let productId = req.params.productId;
    let update = req.body;

    Product.findByIdAndUpdate(productId, update, (err, productUpdated) => {
      if (err) response(500, "R002", "Error to update product", "error", {}, res);
      if (!productUpdated) response(404, "R003", "Product not found", "success", {}, res);

      return response(200, "R001", "product modfify", "success", {product: productUpdated}, res);
    });
  }

  static delete(req, res) {
    let productId = req.params.productId;

    Product.findById(productId, (err, product) => {
      if (err) response(500, "R002", "Error to delete product", "error", {}, res);

      product.remove((error) => {
        if (error) response(500, "R002", "Error to delete product", "error", {}, res);

        return response(200, "R001", "product removed", "success", {}, res);
      });
    });
  }

  static addSell(productId, sell, stock) {

    Product.findByIdAndUpdate(productId, {sell: sell, stock: stock }, (err, productUpdated) => {
      if (err) return false
      if (productUpdated == null) return false

      return true
    });
  }
}
