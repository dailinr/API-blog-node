
// Aqui van todos los metodos y funcionalidades de nuestra api

const validator = require("validator");
const Articulo = require("../modelos/Articulo"); // importamos el doc articulo de nuestro modelo db

// trabajaremos con programacion funcional (callback)
const prueba = (req, res) => {

    return res.status(200).json({ 
        mensaje: "Soy un accion de pruebas en mi controlador de articulos"
    });
};


const crear = async (req, res) => {

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

    // Crear el objeto a guardar y asignar valores a objetos basado en el modelo db 
    const articulo = new Articulo(parametros);  // automatico
    // articulo.titulo = parametros.titulo; -- manual
    
    
    try {
        // Guardar el artículo en la base de datos
        const articuloGuardado = await articulo.save();

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulo: articuloGuardado,
            mensaje: "Artículo creado con éxito!!"
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "No se ha guardado el artículo correctamente"
        });
    }

}

// metodo para conseguir los articulos a listar
const listar = async (req, res) => {

    try {
        // Crear la consulta base
        let query = Articulo.find({});

        // Verificar si hay un parámetro "recientes"
        if(req.params.recientes){ 
            // Aplicar limit para obtener solo los primeros 3 datos
            query = query.limit(3);
        }

       // Aplicar sort para ordenar por fecha en orden descendente (mayor a menor) 
        query = query.sort({ fecha: -1 }); 

        // Ejecutar la consulta
        let articulos = await query; // si hay un parametro devuelve 3, y sino devuelve todos
        
        console.log("longitud: " + articulos.length);

        if (!articulos || articulos.length === 0) { // Si no hay artículos encontrados

            return res.status(404).json({
                status: "error",
                mensaje: "No se han encontrado artículos"
            });
        }

        // Si no hay errores devuelve un status de éxito y los datos de los artículos
        return res.status(200).json({
            status: "success",
            contador: articulos.length,
            parametro: req.params.recientes, // request a la url con parametro "recientes"
            articulos
        });

    } catch (error) {
        // Capturar cualquier error que ocurra durante la consulta
        return res.status(500).json({
            status: "error",
            mensaje: "Error al obtener los artículos"
        });
    }
};

module.exports = {
    prueba,
    crear,
    listar,
}