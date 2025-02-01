// Importar modelos DB
const Notificacion = require("../modelos/Notificacion");
const User = require("../modelos/Usuario");

// Importar servicio follows
const followService = require("../serivicios/followService");
const mongoosePaginate = require("mongoose-paginate-v2");

const pruebaNoti = (req, res) => {

    return res.status(200).send({
        status: "success",
        mensaje: "prueba notificaciones exitosa!!"
    });
}

// Notificacion de nuevos seguimientos
const saveFollows = async(req, res) => {

    const { idUser: idUser, idSeguidor: idSeguidor } = req.body

    try {
        // Guardar la notificación
        const notificacion = new Notificacion({
            user: idUser,
            seguidor: idSeguidor,
        });
        const notiGuardada = await notificacion.save();

        return res.status(200).json({
            status: "success",
            message: "Notificación guardada",
            notificacion: notiGuardada,
        });
    } 
    catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
}

// Mostrar todas las notificaciones de un usuario
const mostrarNotis = async(req, res) => {

    let page = 1;

    if(req.params.page) page = req.params.page;

    let itemsForPage = 5;

    // recibir id del usuario por body
    const idUser = req.params.id;

    try{
        // Obtener las notis de la DB
        let notis = await Notificacion.paginate({user : idUser}, {
            populate: {
                path: "seguidor",
                select: "-password -__v  -role -email -created_at"
            },
            page: page,
            limit: itemsForPage,
            sort: { created_at: -1 }
        });

        // Extraer solo las notis y devolverlos sin el campo "docs"
        const { docs: notisData, ...paginationInfo } = notis;


        return res.status(200).send({
            status: "success",
            mensaje: "lista de notificaciones",
            notificaciones: notisData,
            pagination: paginationInfo
        })
        
    }
    catch(error){
        return res.status(500).json({ status: "error", message: error.message });
    }
}

module.exports = {
    pruebaNoti,
    saveFollows,
    mostrarNotis
}