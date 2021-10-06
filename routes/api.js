const express = require ("express");
const router = express.Router();

const apiController = require("../controllers/apiController");

// http://localhost:5000/api/teste
router.get("/ping", apiController.ping)
router.get("/teste", apiController.test)
router.get("/home", apiController.home)
router.get("/captcha", apiController.captcha)
router.get("/twofa", apiController.twofa)

router.get("/list",apiController.list);
router.post("/register",apiController.register);
router.post("/verify",apiController.verify);
router.post("/validate",apiController.validate);
router.get("/qrcode/:id",apiController.qrcode);


module.exports = router;
