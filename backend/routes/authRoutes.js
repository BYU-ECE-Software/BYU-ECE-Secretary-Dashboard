const express = require("express");
const {
    login,
    callback,
    logout,
    status
} = require("../controllers/authController");

const router = express.Router();

router.get("/login", login);     
router.post("/callback", callback);
router.get("/logout", logout);
router.get("/status", status);     

module.exports = router;