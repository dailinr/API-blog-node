const express = require("express"); // importamos el metodo express
const router = express.Router(); // tendremos un objeto que tendrá las funciones del metodo Router

// cargamos el controlador
const ArticuloControlador = require("../controladores/articulo");

// Rutas de prueba
router.get("/ruta-de-prueba", ArticuloControlador.prueba); // parametros: nombre de url, el objeto del controlador con el metodo prueba

// Rutas utiles de nuestra api
router.post("/crear", ArticuloControlador.crear); // metodo post porque se está enviando informacion

module.exports = router; // exportamos el objeto router con las rutas de prueba 