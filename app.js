'use strict'

import express from 'express';
import bodyParser from 'body-parser';// libreria transformar datos a formato Json
const app = express()
import cors from 'cors'; //libreria para que no genere problema al llamar desde frontend
app.use(cors())

import router from './src/routers/router' //rutas de las api 

app.use(bodyParser.urlencoded({ extended:false}))
app.use(bodyParser.json())
app.use('/api', router)

module.exports = app