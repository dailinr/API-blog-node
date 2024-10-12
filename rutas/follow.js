const express = require("express");
const router = express.Router();
const check = require("../middlewares/auth");

const FollowController = require("../controladores/follow");
const Follow = require("../modelos/Follow");

router.get("/prueba", FollowController.pruebaFollow);
router.post("/save",  check.auth, FollowController.save);


module.exports = router;