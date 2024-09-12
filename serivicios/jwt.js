// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta
const secret = "CLAVE_SECRETA_del_proyecto_DEL_blOG_270302";

// Crear funcion para generar tokens
const createToken = (user) => { // ya q es solo una funcion se exporta asi
    const payload = { 
        // 
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email, 
        role: user.role,
        image: user.image,
        iat: moment().unix(), // tiempo en que sea crea el token
        exp: moment().add(30, "days").unix(), // fecha de expiracion (en 3 días)
    };

    // Devolver el token jwt codificado 
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}