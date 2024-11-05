
// Aqui van todos los metodos y funcionalidades de nuestra api

const Articulo = require("../modelos/Articulo"); // importamos el doc articulo de nuestro modelo db
const { validarArticulo } = require("./../helpers/validarArticulo");
const fs = require("fs"); // libreria para borrar archivo
const path = require("path"); // me permite coger un archivo y poder enviarlo

// importar servicios
const followService = require("../serivicios/followService")

// trabajaremos con programacion funcional (callback)
const prueba = (req, res) => {

    return res.status(200).json({
        mensaje: "Soy un accion de pruebas en mi controlador de articulos"
    });
};

// Metodo para crear nuevos articulos en la db
const crear = async (req, res) => {

    // Recoger los parametros por post a guardar
    let parametros = req.body;

    // validar datos
    try {
        validarArticulo(parametros);

    } catch (error) {
        return res.status(400).json({
            status: "error",
            mensaje: "Faltan datos por enviar",
        });
    }

    // Crear el objeto a guardar y asignar valores a objetos basado en el modelo db 
    const articulo = new Articulo(parametros);  // automatico
    // articulo.titulo = parametros.titulo; -- manual
    articulo.user = req.user.id;


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

// Metodo para conseguir los articulos de la db a listar
const listar = async (req, res) => {

    let page = 1; // Sacar la pagina actual

    // Verificar si hay un parámetro 
    if(req.params.page) page = req.params.page;

    // Establecer numero de elementos por pagina
    const itemsPerPage = 8;

    try{
        
        let articulos = await Articulo.paginate(
            { },
            {
                populate: {
                    path: "user",
                    select: "-password -__v  -role -email"
                },
                select: "-__v",
                page: page,
                limit: itemsPerPage,
                sort: { fecha: -1 } 
            }
        );

        if(!articulos || articulos.docs.length === 0){

            return res.status(400).send({
                status: "error",
                mensaje: "No se obtuvo ningún articulo de la consulta"
            })
        }

        // Extraer solo los artículos y devolverlos sin el campo "docs"
        const { docs: articulosData, ...paginationInfo } = articulos;

        return res.status(200).send({
            status: "success",
            message: "Listado de todos los articulos",
            articulos: articulosData,  // Enviar los artículos directamente
            pagination: paginationInfo  // Devolver información de paginación (opcional)
        });
    }
    catch(error){
        // Capturar cualquier error que ocurra durante la consulta
        return res.status(500).send({
            status: "error",
            mensaje: "Error al obtener los artículos"
        })
    }
};

// Metodo para conseguir un articulo en especifico
const obtener = async (req, res) => {

    try {
        // Recoger un id por la url
        const id = req.params.id;

        // Verificar que el id sea válido
        if (!id || id.length !== 24) { // MongoDB ObjectId tiene 24 caracteres
            return res.status(400).json({
                status: "error",
                mensaje: "ID no válido"
            });
        }

        // Buscar el articulo por id
        let articulo = await Articulo.findById(id);

        // Verificar si el artículo fue encontrado
        if (!articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se ha encontrado el artículo"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulo
        });

    } catch (error) {
        // Manejar errores generales, incluyendo errores de base de datos
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar el articulo"
        });
    }

}

// Metodo para borrar un articulo de la base de datos
const borrar = async (req, res) => {

    try {
        // Recoger un id por la url
        const id = req.params.id;

        // Verificar que el id sea válido
        if (!id || id.length !== 24) {
            return res.status(400).json({
                status: "error",
                mensaje: "ID no válido"
            });
        }

        // Buscar el articulo por id y borrarlo
        // let articuloBorrado = await Articulo.findByIdAndDelete({"user": req.user.id,  _id: id }); // _id (db) sea igual id de la ruta controlador
        let articuloBorrado = await Articulo.findOneAndDelete({ "user": req.user.id, _id: id }); // _id (db) sea igual id de la ruta controlador y comprueba que el user del creador sea el mismo autenticado


        // Verificar si el artículo fue encontrado
        if (!articuloBorrado) {
            return res.status(404).json({
                status: "error",
                mensaje: "Error al borrar el artículo"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulo: articuloBorrado,
            mensaje: "Articulo borrado exitosamente"
        });

    } 
    catch (error) {
        // Manejar errores generales, incluyendo errores de base de datos
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar el articulo"
        });
    }
}

// Metodo para actualizar un articulo 
const editar = async (req, res) => {

    try {
        // Recoger un id por la url
        const id = req.params.id;

        // Verificar que el id sea válido
        if (!id || id.length !== 24) {
            return res.status(400).json({
                status: "error",
                mensaje: "ID no válido"
            });
        }

        // Recoger datos del body (enviados por form)
        let parametros = req.body;

        // validar datos
        try {
            validarArticulo(parametros);

        } catch (error) {
            return res.status(400).json({
                status: "error",
                mensaje: "Faltan datos por enviar",
            });
        }

        // Buscar y actualizar articulos (todas las propiedades de la base de datos)
        const articuloActualizado = await Articulo.findOneAndUpdate(
            { _id: id },
            parametros,
            { new: true }
        );

        // Verificar si el artículo fue actualizado
        if (!articuloActualizado) {
            return res.status(404).json({
                status: "error",
                mensaje: "Error al actualizar el artículo"
            });
        }

        // Devolver resultado
        return res.status(200).json({
            status: "success",
            articulo: articuloActualizado,
            mensaje: "Articulo actualizado exitosamente"
        });


    } catch (error) {
        // Manejar errores generales, incluyendo errores de base de datos
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar el articulo"
        });
    }
}

// Subir ficheros e imagenes del articulo
const subirImagen = async (req, res) => {

    // sacar id del articulo
    const articuloId = req.params.id;

    // Recoger el fichero de imagenes y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"
        });
    } 

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar extension
    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){
        const filePath = req.file.path;
        
        // Si no es correcto, borrar archivo
        const fileDelete = fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "La extension de la imagen no es valida"
        });
    }
    

    // Si sí es correcta, guardar imagen en BD
    try {
        let articuloUpdated = await Articulo.findOneAndUpdate({"user": req.user.id, "_id": articuloId}, {imagen: req.file.filename}, {new: true});

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            articulo: articuloUpdated,
            imagen: req.file,
        });
    }
    catch(error){
        return res.status(500).send({
            status: "error",
            message: "Error en la subida del avatar del usuario!"
        });
    }
}

// poder ver imagen de cada articulo
const verImagen = (req, res) => {
    let fichero =  req.params.fichero; 
    let rutaFisica = "./imagenes/articulos/" + fichero; 

    // Verificar que el id sea válido y tenga acceso a ese fichero
    fs.stat(rutaFisica, (error, existe) => {
        
        if (existe) {
            // devolvermos como respuesta un archivo como tal
            return res.sendFile(path.resolve(rutaFisica));
        }
        else{
            // si hay algun error 
            return res.status(404).json({
                status: "error",
                mensaje: "La imagen no existe",
                existe,
                fichero, 
                rutaFisica
            });
        }
    })
}

// Buscar en nuestros articulos de la base de datos
const buscar = (req, res) => {
    // Sacar el string de busqueda
    let busqueda = req.params.busqueda;

    // Find con OR a db
    Articulo.find({
        // Ejecutar consulta
        // select * fron articulos where titulo = x or titulo = y
        "$or": [
            // si el titulo incluye el string que tiene "busqueda"
            { titulo: { "$regex": busqueda, "$options": "i" } }, // $regex para incluir una expresion regular
            { contenido: { "$regex": busqueda, "$options": "i" } },
            { etiqueta: { "$regex": busqueda, "$options": "i" } },
        ]
    })
    .sort({fecha: -1})  // ordenamos ascendentemente 
    .then(articulosEncontrados => {
        if(!articulosEncontrados || articulosEncontrados.length <= 0){
            return res.status(404).json({
                status: "error",
                mensaje: "no se ha encontrado ninguna similitud"
            })
        }
        // Si no hay errores devolver resultado
        return res.status(200).json({
            status: "success",
            articulos: articulosEncontrados
        })
    })
    .catch(error => {
        console.error(error);
        return res.status(500).json({
            status: "error",
            mensaje: "Error al realizar la consulta"
        });
    });

}

const articulosUser = async (req, res) => {

    // Sacar el id de usuario (me llega por la url)
    const userId = req.params.id;

    // Controlar la pagina
    let page = 1;

    if(req.params.page) page = req.params.page;

    const itemsPerPage = 5; // 5 usuarios por pagina

    // Find, populate, ordenar, paginar
    try{
        let artUser = await Articulo.paginate(
            { "user": userId },  // Filtro para buscar artículos del usuario
            {
                sort: { fecha: -1 }, // Ordenar por fecha descendente
                populate: {
                    path: "user", select: '-password -__v -role -email' 
                }, 
                page: page,           // Número de página
                limit: itemsPerPage    
            }
        );

        if(!artUser || artUser.totalDocs <= 0){
            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones por mostrar de este usuario"
            });
        }
    
        // Devolver respuesta 
        return res.status(200).json({
            status: "success",
            message: "Publicaciones del perfil de un usuario",
            page: artUser.page,
            total: artUser.totalDocs,
            pages: artUser.totalPages,
            artUser
        }); 
    }
    catch(error){
        return res.status(400).send({
            status: "error",
            message: "Hubo un error al obtener los articulos del usuario"
        });
    }
    
}

const feed = async(req, res) => {

    // Sacar la pagina actual
    let page = 1;
    if(req.params.page) page = req.params.page;

    // Establecer numero de elementos por pagina
    const itemsPerPage = 8;

    try{
        // Sacar un array de ids de usuarios que yo sigo como usuario identificado
        const myFollows = await followService.followUserIds(req.user.id);

        //  devuelva los articulos. ordenar, popular, paginar
        let articulos = await Articulo.paginate(
            // articulos de cualquier user que esté en mis seguidos
            {   "user": {"$in": myFollows.following}},
            {
                populate: {
                    path: "user",
                    select: "-password -__v  -role -email"
                },
                select: "-__v",
                page: page,
                limit: itemsPerPage,
                sort: { fecha: -1 } 
            }
        );

        if(!articulos || articulos.docs.length === 0){

            return res.status(400).send({
                status: "error",
                mensaje: "No se obtuvo ningún articulo de la consulta"
            })
        }

        // Extraer solo los artículos y devolverlos sin el campo "docs"
        const { docs: articulosData, ...paginationInfo } = articulos;

        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            myFollows: myFollows.following,
            articulos: articulosData,  // Enviar los artículos directamente
            pagination: paginationInfo  // Devolver información de paginación (opcional)
        });
    }
    catch(error){
        return res.status(500).send({
            status: "error",
            mensaje: "Error en consulta de follows"
        })
    }
    
}

const incrementarVistas = async (req, res) => {

    try {
        // obtener el id del articulo
        const idArticulo = req.params.id;
        
        const articulo = await Articulo.findByIdAndUpdate(
            idArticulo,
            { $inc: { views: 1 } }, // Incrementa en 1 la cantidad de vistas
            { new: true }           // Retorna el documento actualizado
        );

        if (!articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontró el artículo"
            });
        }

        return res.status(200).json({
            status: "success",
            mensaje: "Artículo visto e incrementado",
            articulo
        });
    } 
    catch (error) {

        return res.status(500).json({
            status: "error",
            mensaje: "Error al incrementar las vistas del artículo"
        });
    }
};

const obtenerMasVistos = async (req, res) => {

    try {
        
        const articulosMasVistos = await Articulo.find()
            .sort({ views: -1 }) // Ordena por vistas de mayor a menor
            .limit(10);           // Limita a los 10 más vistos

        return res.status(200).json({
            status: "success",
            mensaje: "Artículos más vistos",
            articulos: articulosMasVistos
        });
    } 
    catch (error) {

        return res.status(500).json({
            status: "error",
            mensaje: "Error al obtener los artículos más vistos"
        });
    }
};



module.exports = {
    prueba,
    crear,
    listar,
    obtener,
    borrar,
    editar,
    subirImagen,
    verImagen,
    buscar,
    articulosUser,
    feed,
    incrementarVistas,
    obtenerMasVistos
}