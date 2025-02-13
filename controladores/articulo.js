
// Aqui van todos los metodos y funcionalidades de nuestra api

const Articulo = require("../modelos/Articulo"); // importamos el doc articulo de nuestro modelo db
const Usuario = require("../modelos/Usuario");
const { validarArticulo } = require("../helpers/validarArticulo");
const fs = require("fs"); // libreria para borrar archivo
const path = require("path"); // me permite coger un archivo y poder enviarlo
const cloudinary = require("../cloudinary");

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

    const articulo = await Articulo.findById(articuloId);
    if (!articulo) {
        return res.status(404).send({
            status: "error",
            message: "El artículo no existe"
        });
    }

    // Recoger el fichero de imagenes y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"
        });
    } 
    // Guardar la ruta del archivo local antes de subir a Cloudinary
    const filePath = req.file.path;  

    try {
        // Subir imagen a Cloudinary
        const resultado = await cloudinary.uploader.upload(req.file.path, {
            folder: "articulos" // Carpeta dentro de Cloudinary
        });

        // Verificar si el archivo temporal existe antes de eliminarlo
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Guardar la URL de la imagen en la base de datos
        const articuloUpdated = await Articulo.findOneAndUpdate(
            { "user": req.user.id, "_id": articuloId },
            { imagen: resultado.secure_url },
            { new: true }
        );

        return res.status(200).send({
            status: "success",
            articulo: articuloUpdated,
            imagen: resultado.secure_url
        });
    } 
    catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al subir la imagen",
            error: error.message
        });
    }
};

// ver la imagen de cada articulo
const verImagen = async (req, res) => {

    try {
        const articuloId = req.params.id;

        // Buscar el artículo en la base de datos
        const articulo = await Articulo.findById(articuloId);

        if (!articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "Artículo no encontrado"
            });
        }

        if (!articulo.imagen) {
            return res.status(404).json({
                status: "error",
                mensaje: "El artículo no tiene imagen"
            });
        }

        // Devolver la URL de la imagen
        return res.status(200).json({
            status: "success",
            imagen: articulo.imagen
        });

    } 
    catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al obtener la imagen",
            error: error.message
        });
    }
};


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
        
        const articulosMasVistos = await Articulo.paginate({},
            {
                populate: {
                    path: "user",
                    select: "-password -__v  -role -email"
                },
                limit: 10,
                sort: { views: -1 } 
            }
        );
        
        // Extraer solo los artículos y devolverlos sin el campo "docs"
        const { docs: articulosMasVistosData, ...paginationInfo } = articulosMasVistos;

        return res.status(200).json({
            status: "success",
            mensaje: "Artículos más vistos",
            articulos: articulosMasVistosData,
            pagination: paginationInfo
        });
    } 
    catch (error) {

        return res.status(500).json({
            status: "error",
            mensaje: "Error al obtener los artículos más vistos"
        });
    }
};

const guardarFavs = async(req, res) => {

    // idArticulo a marcar favorito y el usuario logeado
    const idArticulo = req.params.id;
    const idUsuario = req.user.id; 

    try{
        // Buscar el artículo
        const articulo = await Articulo.findById(idArticulo);
        if (!articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontró el artículo"
            });
        }

        // Buscar al usuario y actualizar su lista de favoritos
        const usuario = await Usuario.findById(idUsuario);
        if (!usuario) {
            return res.status(404).json({
                status: "error",
                mensaje: "Usuario no encontrado"
            });
        }

        // Verificar si el artículo ya está en favoritos
        if (!usuario.favoritos.includes(idArticulo)) {
            usuario.favoritos.push(idArticulo);
            await usuario.save();
        }

        return res.status(200).json({
            status: "success",
            mensaje: "Artículo agregado a favoritos",
            favoritos: usuario.favoritos
        });
    }
    catch(error){

        return res.status(500).json({
            status: "error",
            mensaje: "Error al guardar el favorito",
            error: error.message
        });
    }
}

const eliminarFavs = async(req, res) => {
    // idArticulo a eliminar de favoritos y el usuario logeado
    const idArticulo = req.params.id;
    const idUsuario = req.user.id;

    try{
        // Buscar el artículo
        const articulo = await Articulo.findById(idArticulo);
        if (!articulo) {
            return res.status(404).json({
                status: "error",
                mensaje: "No se encontró el artículo"
            });
        }

        // Buscar al usuario y actualizar su lista de favoritos
        const usuario = await Usuario.findById(idUsuario);
        if (!usuario) {
            return res.status(404).json({
                status: "error",
                mensaje: "Usuario no encontrado"
            });
        }

        // Eliminar el artículo de la lista de favoritos
        usuario.favoritos = usuario.favoritos.filter(fav => fav.toString() !== idArticulo);

        // Guardar los cambios en la base de datos
        await usuario.save();

        return res.status(200).json({
            status: "success",
            mensaje: "Artículo eliminado de favoritos",
            favoritos: usuario.favoritos
        });
    }
    catch(error){
        return res.status(500).json({
            status: "error",
            mensaje: "Error al eliminar el favorito",
            error: error.message
        });

    }
}

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
    obtenerMasVistos,
    guardarFavs,
    eliminarFavs
}