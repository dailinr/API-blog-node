
// Aqui van todos los metodos y funcionalidades de nuestra api

const validator = require("validator");

// trabajaremos con programacion funcional (callback)
const prueba = (req, res) => {

    return res.status(200).json({ 
        mensaje: "Soy un accion de pruebas en mi controlador de articulos"
    });
};


const crear = (req, res) => {

    // Recoger los parametros por post a guardar
    let parametros = req.body;

    // Validar datos
    try{
        let valLongTitulo = validator.isLength(parametros.titulo, {min: 5, max: undefined}); // valiudamos que tenga una longitud entre 5 - sin limite
        let validarTitulo = !validator.isEmpty(parametros.titulo) && valLongTitulo; // validar si el titulo no está vacio
                             
        let validarContenido = !validator.isEmpty(parametros.contenido);

        if(!validarTitulo || !validarContenido){
            throw new Error("No se ha validado la información !!"); // se lanzaria una excepción
        }

    }catch(error){
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar",
        });
    }

    // Crear el objeto a guardar

    // Asignar valores a objetos basado en el modelo db (manual o automatico)

    // Guardar el articulo en la base de datos

    // Devolver resultado

    return res.status(200).json({
        mensaje: "Accion de guardar",
        parametros,
    });
}

module.exports = {
    prueba,
    crear,
}