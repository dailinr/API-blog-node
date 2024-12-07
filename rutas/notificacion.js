const express = require("express");
const router = express.Router();
const check = require("../middlewares/auth");

const NotiController = require("../controladores/notificacion");
const Notificacion = require("../modelos/Notificacion");

router.get("/prueba", NotiController.pruebaNoti);
router.post("/follows", check.auth, NotiController.saveFollows);
router.get("/mostrar/:id", check.auth, NotiController.mostrarNotis);

module.exports = router;