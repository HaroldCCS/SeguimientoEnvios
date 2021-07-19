'use strict'

import services from '../services'
import response from '../util/response'

export default class Auth{

  static isAuth(req, res, next, status) {
    if (!req.headers.authorization) {
      return response(403, "R002", "No have access", "error", {}, res);
    }
    const token = req.headers.authorization

    services.decodeToken(token, status)
    .then(resp => {
      req.user = resp
      next()
    })
    .catch(error => {
      return response(error.status, "R002", error.message, "error", {}, res);

    })
  }
  static admin(req, res, next) {
    Auth.isAuth(req, res, next, 1)
  }
  static staff(req, res, next) {
    Auth.isAuth(req, res, next, 2)
  }
  static client(req, res, next) {
    Auth.isAuth(req, res, next, 3)
  }
}
