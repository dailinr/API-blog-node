// Importar dependencias y modulos
const bcrypt = require("bcrypt");

// Importar modelo DB
const User = require("../modelos/Usuario");

// Importar servicios
const jwt = require("../serivicios/jwt");

// Acciones de prueba
const pruebaUsuario = (req, res) => {
    
    return res.status(200).send({
        message: "mensaje enviado desde el controlador",
        usuario: req.user,
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

// Autenticacion de usuario
const login = async (req, res) => {

    // Recoger parametros del body
    let params = req.body;

    if(!params.email || !params.password){
        
        return res.status(400).send({
            status: "error",
            mensaje: "No se recibieron los datos del usuario correctamente",
        });
    }

    try{
        // Buscar en la DB si existe el email usuario
        let user = await User.findOne({email: params.email}); //.select("password", 0);  select para impedir que se envien los datos de ese campo 

        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).send({
                status: "error", 
                mensaje: "El usuario no existe o no se pudo encontrar"
            });
        }

        // Comprobar su contraseña es correcta (parametro enviado desde form, hash guardado en DB)
        const pwd = bcrypt.compareSync(params.password, user.password);

        // Si la contraseña no coincide
        if(!pwd){
            return res.status(400).send({
                status: "error",
                mensaje: "La contraseña es invalida"
            });
        }

        // conseguir el token
        const token = jwt.createToken(user);

        // Devolver datos de usuario
        return res.status(200).send({
            status: "success",
            mensaje: "Usuario identificado correctamente!! ",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    }
    catch(error){
        
        return res.status(500).send({
            status: "error", 
            mensaje: "Error en el servidor"
        });
    }
    
}

// Exportar acciones
module.exports = {
    pruebaUsuario, 
    registrar,
    login
}