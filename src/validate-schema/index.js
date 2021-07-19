import Ajv from "ajv"
const optionsAjv = {
    allErrors: true,
    strictTypes: false
};
const ajv = new Ajv(optionsAjv)

import schema_userRegister from "./schema_userRegister.json"
import schema_userLogin from "./schema_userLogin.json"
import schema_clientRegister from "./schema_clientRegister.json"
import schema_productRegister from "./schema_productRegister.json"
import schema_productUpdate from "./schema_productUpdate.json"
import schema_billRegister from "./schema_billRegister.json"
import schema_billUpdate from "./schema_billUpdate.json"
import schema_billState from "./schema_billState.json"
import schema_billCalificate from "./schema_billCalificate.json"

//register schemas
ajv.addSchema(schema_userRegister, "schema_userRegister");
ajv.addSchema(schema_userLogin, "schema_userLogin");
ajv.addSchema(schema_clientRegister, "schema_clientRegister");
ajv.addSchema(schema_productRegister, "schema_productRegister");
ajv.addSchema(schema_productUpdate, "schema_productUpdate");
ajv.addSchema(schema_billRegister, "schema_billRegister");
ajv.addSchema(schema_billUpdate, "schema_billUpdate");
ajv.addSchema(schema_billState, "schema_billState");
ajv.addSchema(schema_billCalificate, "schema_billCalificate");

export default ajv;

//helpers
/**
 * @param {object[]} errors Objects of the errors in validation
*/
export const parseSimpleErrors = function (errors) {
    return errors.map(({ message, params, dataPath, keyword,instancePath }) => {
        try {
            const property = instancePath.substring(1);
            if ('enum' === keyword) {
                return `${message} ${params.allowedValues} '${property}'`
            }
            if (params.hasOwnProperty("additionalProperty")) {
                return `${message} '${params.additionalProperty}'`
            }
            if (dataPath) {
                return `${message} '${property}'`;
            }
            if(message.includes(property)){
                return message ;
            }
            return `${message} '${property}'`;
        } catch (error) {
            return message;
        }
    })
}

export function processValidationBodyJsonSchema(body, nameSchema) {
    const method = "processValidationBodyJsonSchema";
    const validateSchema = ajv.getSchema(nameSchema);
	if (!validateSchema(body)) {
        let response = {
            code: "R004",
            message: 'Please send a correct body request.',
            type: 'error',
            data: {}
        }
		const errors = parseSimpleErrors(validateSchema.errors);
		const messageError = `Error al realizar las validaciones [json-schema] : ${JSON.stringify(errors)}`;
        return {status: true, response: response, messageError: messageError, method: method}

	}
    return {status: false}
}