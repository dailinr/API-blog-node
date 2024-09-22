const express = require("express");
const router = express.Router();
const multer = require("multer");
const check = require("../middlewares/auth");

const UserController = require("../controladores/usuario");

// Configuración de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./imagenes/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-"+ Date.now() + "-" + file.originalname)
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
router.get("/avatar/:file", check.auth, UserController.avatar);

// Exporto las rutas para poder ser utilizadas en otro archivo
module.exports = router; 
