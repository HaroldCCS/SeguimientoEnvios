'use strict'

import jwt from 'jwt-simple'
import moment from 'moment'
import config from '../../config/config'

export default class Services{
  static createToken(data, typeAccess) {
    const payload = {
      typeAccess: typeAccess,
      sub: data._id,
      iat: moment().unix, //al momento de llamar la funcion se guarda la fecha
      exp: moment().add(14, 'days').unix(),// fecha de expiracion del token
    }
    return jwt.encode(payload, config.SECRET_TOKEN)
  }

  static decodeToken(token) {
    return new Promise((resolve,reject)=> {
      try {
        const payload = jwt.decode(token, config.SECRET_TOKEN)
        if (payload.exp <= moment().unix()) {
          reject({
            status: 401,
            message: 'El token ha expirado'
          })
        }
        resolve(payload.sub)
      } catch (err) {
        reject({
          status: 500,
          message: 'Invalid Token'
        })
      }
    })
  }

}
