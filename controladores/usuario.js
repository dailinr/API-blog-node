// Importar dependencias y modulos
const User = require("../modelos/Usuario");
const bcrypt = require("bcrypt");

// Acciones de prueba
const pruebaUsuario = (req, res) => {
    
    return res.status(200).send({
        message: "mensaje enviado desde el controlador"
    });
}

// Registro de usuarios
const registrar = async (req, res) => {
    
    // Recoger datos de la peticion
    let params = req.body;

    // Comprobar que me llegan bien (+ validaciones)
    if(!params.name || !params.email || !params.password || !params.nick){

        return res.status(400).json({
            status: "error",
            message: "validacion de registro INCORRECTA "
        });
    }

    try {

        // Control usuarios duplicados
        const users = await User.find({ 
            $or: [ 
                // si coinciden alguno de estos datos si ya existen en la DB..
                { email: { $regex: new RegExp(`^${params.email}$`, 'i') } },
                { nick: { $regex: new RegExp(`^${params.nick}$`, 'i') } }
            ]
        });

        // Si hay usuarios que coinciden con el email o nick, devolver error
        if(users && users.length >= 1){ 
            return res.status(400).json({
                status: "error",
                message: "El usuario ya existe"
            });

        }
        
        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10); // la contraseña a cifrar, numero de incriptaciones, 
        params.password = pwd; // actualizo la contraseña a la ya cifrada (hash)

        // Crear objeto de usuario - guardar
        let userToSave = new User(params);

        // Guardar usuario en base de datos
        try {
            userStore = userToSave.save(); // guarda coleccion en db

            if(!userStore){
                return res.status(500).json({  status: "error",  message: "Error en la peticion de usuarios duplicados", error: error.message  });
            }

            // Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente ",
                user: userStore
            });
        } 
        catch{
            return res.status(500).json({
                status: "error",
                message: "Error al guardar el usuario"
            });
        }
            
    } catch(error){
        return res.status(500).json({
            status: "error",
            message: "Error en la peticion de usuarios duplicados",
            error: error.message
        });
    }

}

// Exportar acciones
module.exports = {
    pruebaUsuario, 
    registrar
}