'use strict'

import services from '../services'

function isAuth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({message: 'no tienes autorizacion'})
  }
  const token = req.headers.authorization

  services.decodeToken(token)
  .then(response => {
    req.user = response
    next()
  })
  .catch(response => {
    res.status(response.status).send({message: response.message})
  })
}

module.exports = isAuth