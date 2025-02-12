const express = require("express"); // importamos el metodo express
const router = express.Router(); // tendremos un objeto que tendrá las funciones del metodo Router
const multer = require("multer"); // libreria para poder subir ficheros e imagenes
const check = require("../middlewares/auth");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

// cargamos el controlador
const ArticuloControlador = require("../controladores/articulo");

// Se indica en que carpeta se almacenarán todos los archivos
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "articulos",
        allowedFormats: ["jpg", "png", "jpeg", "gif"]
    }
});

// le pasamos un objeto con el almacenamiento a multer
const subidas = multer({storage}); 

// Rutas de prueba
router.get("/ruta-de-prueba", ArticuloControlador.prueba); // parametros: nombre de url, el objeto del controlador con el metodo prueba

// Rutas utiles de nuestra api
router.post("/crear", check.auth, ArticuloControlador.crear); // metodo post porque se está enviando informacion
router.get("/listar/:page?", ArticuloControlador.listar); // listar todos los articulos y listar (:) parametro recientes es (?) opcional
router.get("/articulo/:id", check.auth, ArticuloControlador.obtener); // obtener un articulo especifico, parametro obligatorio
router.delete("/articulo/:id", check.auth, ArticuloControlador.borrar); // borrar un articulo segun id
router.put("/articulo/:id", ArticuloControlador.editar); // actulizar las propiedades del articulo
router.post("/subir-imagen/:id", [check.auth, subidas.single("file0")], ArticuloControlador.subirImagen); // [un arreglo de varios] , single: se va a subir una sola, nombre d subida del campodb 
router.get("/ver-imagen/:fichero",  ArticuloControlador.verImagen); // parametro: el url del fichero de la imagen
router.get("/buscar/:busqueda", check.auth, ArticuloControlador.buscar);
router.get("/articulos-usuario/:id/:page?", check.auth, ArticuloControlador.articulosUser );
router.get("/feed/:page?", check.auth, ArticuloControlador.feed);
router.get("/ver/:id", check.auth, ArticuloControlador.incrementarVistas);
router.get("/mas-vistos", ArticuloControlador.obtenerMasVistos); 
router.post("/add-favoritos/:id", check.auth, ArticuloControlador.guardarFavs); 
router.delete("/eliminar-favs/:id", check.auth, ArticuloControlador.eliminarFavs);


module.exports = router; 