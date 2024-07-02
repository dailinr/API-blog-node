// Validar datos del articulo
const validator = require("validator");

const validarArticulo = (parametros) => {
    
    
    let valLongTitulo = validator.isLength(parametros.titulo, {min: 5, max: undefined}); // valiudamos que tenga una longitud entre 5 - sin limite
    let validarTitulo = !validator.isEmpty(parametros.titulo) && valLongTitulo; // validar si el titulo no está vacio
                            
    let validarContenido = !validator.isEmpty(parametros.contenido);

    if(!validarTitulo || !validarContenido){
        throw new Error("No se ha validado la información !!"); // se lanzaria una excepción
    }
    
}

module.exports = {
    validarArticulo
}