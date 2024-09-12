const express = require("express");
const router = express.Router();
const check = require("../middlewares/auth");

const UserController = require("../controladores/usuario");

// Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUsuario);
router.post("/registrar", UserController.registrar);
router.post("/login", UserController.login);


// Exporto las rutas para poder ser utilizadas en otro archivo
module.exports = router; 
