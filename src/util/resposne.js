function response(status, code, message, type, data, res){
    let responseData = { code: code, message: message, type: type, data: data }

    return res.status(status).send(responseData);
}

export default response;
