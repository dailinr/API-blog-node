const express = require("express"); // importamos el metodo express
const router = express.Router(); // tendremos un objeto que tendrá las funciones del metodo Router
const multer = require("multer"); // libreria para poder subir ficheros e imagenes

// cargamos el controlador
const ArticuloControlador = require("../controladores/articulo");


// Se indica en que carpeta se almacenarán todos los archivos
const almacenamiento = multer.diskStorage({

    destination: function(req, file, cb) { // parametros: una request y el archivo que se va a subir, cb nos permite indicar el destino
        cb(null, './imagenes/articulos/'); // en esta carpeta se guardarán
    },
    filename: function(req, file, cb) {
        cb(null, "articulo" + Date.now() + file.originalname);
    }
});

// le pasamos un objeto con el almacenamiento a multer
const subidas = multer({storage: almacenamiento}); 

// Rutas de prueba
router.get("/ruta-de-prueba", ArticuloControlador.prueba); // parametros: nombre de url, el objeto del controlador con el metodo prueba

// Rutas utiles de nuestra api
router.post("/crear", ArticuloControlador.crear); // metodo post porque se está enviando informacion
router.get("/listar/:recientes?", ArticuloControlador.listar); // listar todos los articulos y listar (:) parametro recientes es (?) opcional
router.get("/articulo/:id", ArticuloControlador.obtener); // obtener un articulo especifico, parametro obligatorio
router.delete("/articulo/:id", ArticuloControlador.borrar); // borrar un articulo segun id
router.put("/articulo/:id", ArticuloControlador.editar); // actulizar las propiedades del articulo
router.post("/subir-imagen/:id", [subidas.single("file0")], ArticuloControlador.subirImagen); // [un arreglo de varios] , single: se va a subir una sola, nombre d subida del campodb 
router.get("/ver-imagen/:fichero", ArticuloControlador.verImagen); // parametro: el url del fichero de la imagen

module.exports = router; // exportamos el objeto router con las rutas de prueba 