const express = require("express");
const router = express.Router();

const UserController = require("../controladores/usuario");


// Definir rutas

router.get("/prueba-usuario", UserController.pruebaUsuario);


// Exporto las rutas para poder ser utilizadas en otro archivo
module.exports = router; 
