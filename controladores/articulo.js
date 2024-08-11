
// Aqui van todos los metodos y funcionalidades de nuestra api

const Articulo = require("../modelos/Articulo"); // importamos el doc articulo de nuestro modelo db
const { validarArticulo } = require("./../helpers/validarArticulo");
const fs = require("fs"); // libreria para borrar archivo
const path = require("path"); // me permite coger un archivo y poder enviarlo

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
    
    try {
        // Crear la consulta base
        let query = Articulo.find({});

        // Verificar si hay un parámetro "recientes"
        if (req.params.recientes) {
            // Aplicar limit para obtener solo los primeros 3 datos
            query.limit(3);
        }

        // Aplicar sort para ordenar por fecha en orden descendente (mayor a menor) 
        query.sort({ fecha: -1 });

        // Ejecutar la consulta
        const articulos = await query.exec(); // Ejecutar la consulta de manera asíncrona

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
        let articuloBorrado = await Articulo.findByIdAndDelete({ _id: id }); // _id (db) sea igual id de la ruta controlador

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

    } catch (error) {
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

    // Configurar multer (rutas - articulo.js)

    // Recoger el fichero de imagen subido
    if (!req.file && !req.files) { // comprobar antes que se mande un archivo 

        return res.status(404).json({
            status: "error",
            mensaje: "No se ha subido ninguna imagen"
        });
    }

    // Conseguir el nombre del archivo
    let archivo = req.file.originalname;

    // Conseguir la extensión del archivo
    let archivo_split = archivo.split('\.'); // split es un metodo que te permite cortar un STRING en varias partes
    let extension = archivo_split[1]; // segundo elemento del arreglo (la extension)

    // Comprobar extensión correcta
    if (extension != "png" && extension != "jpg" &&
        extension != "jpeg" && extension != "gif") {

        // borrar archivo sino es imagen
        fs.unlink(req.file.path, (error) => {

            if (error) {
                // Si hay un error al intentar eliminar el archivo, se devuelve un error.
                return res.status(500).json({
                    status: "error",
                    mensaje: "Error al eliminar la imagen"
                });
            }

            return res.status(400).json({
                status: "error",
                mensaje: "Imagen invalida, eliminada con exito"
            });
        });

    } else {
        
        // Si todo va bien, actualizar el articulo
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

            // Buscar y atualizar la propiedad de imagen del articulo
            const articuloActualizado = await Articulo.findOneAndUpdate(
                { _id: id },
                {imagen: req.file.filename},
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
                mensaje: "Articulo actualizado exitosamente",
                articulo: articuloActualizado,
                fichero: req.file
            });


        } catch (error) {
            // Manejar errores generales, incluyendo errores de base de datos
            return res.status(500).json({
                status: "error",
                mensaje: "Error al buscar el articulo"
            });
        }
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

module.exports = {
    prueba,
    crear,
    listar,
    obtener,
    borrar,
    editar,
    subirImagen,
    verImagen,
    buscar
}