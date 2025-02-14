const express = require("express");
const router = express.Router();
const multer = require("multer");
const check = require("../middlewares/auth");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

const UserController = require("../controladores/usuario");

// Configuración de subida
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "avatars",
        allowedFormats: ["jpg", "png", "jpeg", "gif"]
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUsuario);
router.post("/registrar", UserController.registrar);
router.post("/login", UserController.login);
router.get("/perfil/:id", check.auth, UserController.perfil);
router.get("/list/:page?", check.auth, UserController.list);
router.put("/update", check.auth, UserController.update);
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:idUser", UserController.avatar);
router.get("/counters/:id", check.auth, UserController.counters);
router.get("/favoritos", check.auth, UserController.listarFavs);

// Exporto las rutas para poder ser utilizadas en otro archivo
module.exports = router; 
