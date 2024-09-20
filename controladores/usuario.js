// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");

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
            let userStored = await userToSave.save(); // guarda coleccion en db

            if(!userStored){
                return res.status(500).json({  status: "error",  message: "Error en la peticion de usuarios duplicados", error: error.message  });
            }

            // Devolver resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado correctamente ",
                user: userStored
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

// Datos del perfil del usuario
const perfil = async (req, res) => {

    // Recibir parametro del id del usuario url
    const id = req.params.id;

    try{
        // Consulta para sacar los datos del usuario
        const userPerfil = await User.findById(id).select({password: 0, role: 0});

        if (!userPerfil) {
            return res.status(404).send({
                status: "error", 
                mensaje: "El usuario no existe o no se pudo encontrar"
            });
        }

        // Devolver el resultado
        return res.status(200).send({
            status: "success",
            user: userPerfil
        });

    }
    catch(error){
        return res.status(400).send({
            status: "error",
            mensaje: "Error en el servidor"
        });
    }
}

// Listado de usuarios registrados en la plataforma
const list = async (req, res) => {
    
    // Definir la pagina por defecto
    let page = 1;

    // Verificar si hay un valor de página en los parámetros
    if(req.params.page){
        page = parseInt(req.params.page);
    }

    // Número de elementos por página -
    let itemsForPage = 5;
    
    try{
        // Obtener los usuarios de la DB
        let users = await User.paginate({}, {
            page: page,
            limit: itemsForPage,
            sort: { _id: -1 } // Orden descendente por _id
        });

        // Comprobar si hay usuarios
        if(!users || users.docs.length === 0){
            return res.status(404).send({
                status: "error",
                mensaje: "No se encontraron usuarios"
            });
        }
    
        // Devolver el resultado
        return res.status(200).send({
            status: "success", 
            mensaje: "listado de usuarios",
            users: users.docs,
            page: users.page,
            itemsForPage: users.limit,
            total: users.totalDocs,
            pages: users.totalPages,
        });
    }
    catch(error){

        return res.status(500).send({
            status: "error",
            mensaje: "Error en la consulta",
            error
        });
    }

    
}

const update = async (req, res) => {
    // Recoger info del usuario a actualizar
    let userIdentify = req.user;
    let userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    // Comprobar si el usuario ya existe
    try{
        const users = await User.find({ 
            $or: [ 
                // si coinciden alguno de estos datos si ya existen en la DB..
                { email: { $regex: new RegExp(`^${userToUpdate.email}$`, 'i') } },
                { nick: { $regex: new RegExp(`^${userToUpdate.nick}$`, 'i') } }
            ]
        });

        let userIsset = false;

        users.forEach((user) => {
            // si el id el user del modelo es distinto a id del toker user
            if(user && user._id != userIdentify.id){
                userIsset = true;
            }
        });

        if(userIsset){ 
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe"
            });
        } 
        
        // Cifrar la contraseña
        if(userToUpdate.password){
            let pwd = await bcrypt.hash(userToUpdate.password, 10); // la contraseña a cifrar, numero de incriptaciones, 
            userToUpdate.password = pwd; // actualizo la contraseña a la ya cifrada (hash)
        }

        // Buscar y actualizar (id del user a actualizar, objeto a actualizar, parametro para q actualize en la consulta)
        try {
            let userUpdated = await User.findByIdAndUpdate(userIdentify.id, userToUpdate, {new: true});
 
            // Dar una respuesta de exito
            return res.status(200).send({
                status: "success",
                mensaje: "Datos del usuario actualizados correctamente",
                user: userUpdated
            });
        }
        catch(error){
            return res.status(500).json({
                status: "error",
                message: "Error al actualizar los datos del usuario"
            });
        }
        
    } 
    catch(error){
        
        return res.status(500).json({
            status: "error",
            message: "Error en la peticion de usuarios duplicados",
            error: error.message
        });
    }
}

const upload = (req, res) => {

    return res.status(200).send({
        status: "success",
        message: "Subida de imagenes",
        user: req.user
    });
}

// Exportar acciones
module.exports = {
    pruebaUsuario, 
    registrar,
    login,
    perfil,
    list,
    update,
    upload
}