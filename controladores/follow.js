const Follow = require("../modelos/Follow");
const User = require("../modelos/Usuario");
const mongoosePaginate = require("mongoose-paginate-v2");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Prueba controlador de followers"
    });
}

// Guardar un follow - acción de seguir 
const save = async (req, res) => {

    // Conseguir datos por body (entrada)
    const params = req.body;

    // Sacar ID del usuario identificado
    const identity = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({

        user: identity.id, // user actual
        followed: params.followed, // usuario a seguir
    });

    // Guardar objeto en base de datos
    try{
        let followStored = await userToFollow.save();

        if(!followStored){
            return res.status(500).send({
                status: "error",
                mensaje: "no se ha podido dar follow"
            })
        }

        return res.status(200).send({
            status: "success",
            message: "Metodo dar follow",
            identify: req.user,
            follow: followStored
        });
    }
    catch(error){
        return res.status(400).send({
            status: "error",
            mensaje: "Error al guardar nuevo follow"
        });
    }
}

// Borrar un follow - acción dejar de seguir
const unfollow = async (req, res) => {
    
    // Recoger el id del usuario identificado
    const userId = req.user.id;

    // Recoger si el id del usuario que sigo y quiero dar unfollow
    const followedId = req.params.id;

    // Find de las coincidencias y hacer remove
    try {
        const followDeleted = await Follow.findOneAndDelete({
            // donde coincidan los id recogidos y los del modelo
            "user": userId,
            followed: followedId 

        });

        if(!followDeleted){ // Verificar si realmente se eliminó un documento
            return res.status(500).send({
                status: "error",
                mensaje: "Error al dejar de seguir"
            });
        } 

        return res.status(200).send({
            status: "success",
            mensaje: "follow eliminado correctamente",
        });
    }
    catch(error){
        return res.status(400).send({
            status: "error",
            mensaje: "hubo un error al hacer la accion unfollow"
        });
    }

}

// Listado de usuarios que cualquier usuario está siguiendo (siguiendo)
const following = async (req, res) => {

    // Sacar el id del usuario identificado
    let userId = req.user.id;
    
    // comprobar si me llega el id por parametro en url
    if(req.params.id) userId = req.params.id

    // Página actual, por defecto la primera
    let page = 1;
    if(req.params.page) page = parseInt(req.params.page)

    const itemsPerPage = 10;

    try{
        // Ejecutar la consulta usando plugin paginate 
        const siguiendo = await Follow.paginate({"user": userId}, 
            {
                populate: // Populate para obtener los datos de cada usuario
                    { path: "user followed", 
                    select: "-password -__v  -role" }, // Filtrar campos 
                page, // Página actual
                limit: itemsPerPage, // Items por página
                sort: { fecha: -1 } // Orden descendente por fecha
            }
        )

        if(!siguiendo || siguiendo.docs.length === 0){

            return res.status(404).json({
                status: "error",
                mensaje: "No se han encontrado seguidos"
            });
        }

        // Devolver resultados
        return res.status(200).json({
            status: "success",
            contador: siguiendo.totalDocs,
            message: "Listado de usuarios que estoy siguiendo",
            siguiendo: siguiendo.docs,
            page_actual: siguiendo.page,
            itemsForPage: siguiendo.limit,
            pages_total: siguiendo.totalPages,
        });

        

        // array de usuarios en común de un usuario
    }
    catch(error){
        console.error("Error en la consulta a following:", error.message); // Para imprimir el error en la consola del servidor
        return res.status(500).json({
            status: "error",
            mensaje: "Error al obtener la consulta a following",
            error: error.message // Devolver el mensaje de error específico
        });
    }
}

// Listado de usuarios de usuarios que siguen a cualquier otro usuario (mis seguidores)
const followers = async (req, res) => {

    let userId = req.user.id;

    if(req.params.id) userId = req.params.id;

    let page = 1;
    if(req.params.page) page = parseInt(req.params.page);

    const itemsPerPage = 10;

    try{
        // Ejecutar la consulta usando el campo "followed" para encontrar los seguidores
        const seguidores = await Follow.paginate({"followed": userId},
            {
                populate: 
                    { path: "user",
                    select: "-__v -role -password"},
                page,
                limit: itemsPerPage,
                sort: {fecha: -1}
            }
        )

        if(!seguidores || !seguidores.docs.length === 0){

            return res.status(400).send({
                status: "error",
                mensaje: "No se han encontrado seguidores"
            });
        }

        // Devolver una respuesta
        return res.status(200).send({
            status: "success",
            contador: seguidores.totalDocs,
            message: "Listado de usuarios que siguen a este usuario",
            seguidores: seguidores.docs,
            page_actual: seguidores.page,
            itemsForPage: seguidores.limit,
            pages_total: seguidores.totalPages,
        });

    }
    catch(error){
        
        return res.status(500).send({
            status: "error",
            message: "Error al hacer la consulta de followers",
            error: error.message
        });
    }
    
    
}

// Exportar acciones 
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}