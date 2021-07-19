import Services from '../services/index'
import response from './response'

export default class Crud {

	/**
	 * Funcion que permite traer UN registro de una coleccion
	 * @param {Schema} object
	 * @param {object} body
	*/
  static findOne(schema, body) {
    return new Promise((resolve, reject) => {
      schema.findOne(body, (err, res) => {
        console.error(err);
        if (err) reject(500);
        if (!res) reject(400);

        resolve(res);
      });
    });
  }

	/**
	 * Funcion que permite traer todos los registros de una coleccion
	 * @param {Schema} object
	 * @param {object} body
	*/
  static findAll(object) {
    return new Promise((resolve, reject) => {
      object.find((err, res) => {
        if (err) reject(500);
        if (!res) reject(400);

        resolve(res);
      });
    });
  }

	/**
	 * Funcion que permite ingresar sesion para los 3 tipos de usuario
	 * @param {Schema} schema
	 * @param {object} body
	 * @param {number} typeAccess //0 Staff, 1 Client
	 * @param {object} res
	*/
	static async signIn(schema, body, typeAccess, res){
		let token;
    try {
      let value = await Promise.resolve(Crud.findOne(schema ,{ email: body.email, password: body.password }));
			if(typeAccess == 0){
				token = Services.createToken(value, value.typeAccess)
			} else {
				token = Services.createToken(value, 3)
			}
      return response(200, "R001", "Logged successful", "success", {token: token}, res);
    } catch (error) {
      if(error == 400) return response(400, "R003", "wrong username or password", "success", {}, res);
			console.log(error)
      return response(500, "R002", "Internal Service Error", "error", {}, res);
    }
  }

	/**
	 * Funcion que permite traer UN registro de una coleccion
	 * @param {Schema} object
	 * @param {object} body
	*/
  static findEspecific(schema, body, dataSee) {
    return new Promise((resolve, reject) => {
      schema.find(body, dataSee, (err, res) => {
        if (err) reject(500);
        if (!res) reject(400);

        resolve(res);
      });
    });
  }

}
