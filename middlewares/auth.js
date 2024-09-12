// Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

// Importar clave secreta
const libjwt = require("../serivicios/jwt");
const secret = libjwt.secret;

// MIDDLEWARE de autenticación
exports.auth = (req, res, next) => {
    
    // Comprobar si me llega la cabecera de auth
    if(!req.headers.authorization){
        return res.status(403).send({
            status: "error",
            mensaje: "La peticion no tiene la cabecera de autenticación",
        });
    }

    // Decodificar el token - limpiar el token de comilas o simbolos
    let token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        let payload = jwt.decode(token, secret); // datos del usuario identificado

        // comprobar expiración del token
        if(payload.exp <= moment().unix()){ // si la fecha de expiracion es menor a la fecha actual
            return res.status(401).send({
                status: "error",
                mensaje: "El token ha expirado"
            });
        }

        // Agregar datos de usuario a request
        req.user = payload;  // en cada peticion de nuestra api tendra los datos
        
    }
    catch(error){
        return res.status(404).send({
            status: "error",
            mensaje: "Token invalido",
            error
        });
    }

    // Pasar a la ejecucion de la accion (metodo de la ruta)
    next();
}
