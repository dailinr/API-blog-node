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

// Listado de usuarios que estoy siguiendo

// Listado de usuarios que me siguen 

// Exportar acciones 
module.exports = {
    pruebaFollow,
    save
}