'use strict'

import mongoose  from 'mongoose' //libreria conexion con mongo
import app  from './app.js'
import config  from './config/config'

mongoose.connect(config.db, (err, res) => {
  if (err) {
    return console.log('Error al conectar a la base da datos')
  }
  console.log('Conexion a la base de datos establecida...');
})

app.listen(config.port, () => {
  console.log(`api rest corriendo en http://localhost:${config.port}`);
})