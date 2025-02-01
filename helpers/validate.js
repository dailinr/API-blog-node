const validator = require("validator");

const validate = (params) => {
    
    let name = !validator.isEmpty(params.name) &&  // que no esté vacio
        validator.isLength(params.name, {min: 3, max: undefined}) && // un minimo 3 caracteres
        validator.isAlpha(params.name, "es-ES"); // que tenga solo letras del alfabeto español

    let surname = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, {min: 3, max: undefined}) &&
        validator.isAlpha(params.surname, "es-ES");

    let nick = !validator.isEmpty(params.nick) &&
        validator.isLength(params.nick, {min: 3, max: undefined});

    let email = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email);
    
    let password = !validator.isEmpty(params.password);

    if(!name || !surname || !nick || !email || !password ){
        throw new Error("No se ha superado la validación");
    }
    else{
        console.log("validacion superada");
    }
}

module.exports = validate;