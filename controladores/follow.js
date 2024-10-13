const Follow = require("../modelos/Follow");
const User = require("../modelos/Usuario");

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

// Listado de usuarios que estoy siguiendo

// Listado de usuarios que me siguen 

// Exportar acciones 
module.exports = {
    pruebaFollow,
    save,
    unfollow
}