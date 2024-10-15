const express = require("express");
const router = express.Router();
const check = require("../middlewares/auth");

const FollowController = require("../controladores/follow");
const Follow = require("../modelos/Follow");

router.get("/prueba", FollowController.pruebaFollow);
router.post("/save",  check.auth, FollowController.save);
router.delete("/unfollow/:id",  check.auth, FollowController.unfollow);
router.get("/following/:id?/:page?", check.auth, FollowController.following);
router.get("/followers/:id?/:page?", check.auth, FollowController.followers);

module.exports = router;