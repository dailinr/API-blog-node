// Acciones de prueba
const pruebaUsuario = (req, res) => {
    
    return res.status(200).send({
        message: "mensaje enviado desde el controlador"
    });
}

// 

// Exportar acciones
module.exports = {
    pruebaUsuario
}