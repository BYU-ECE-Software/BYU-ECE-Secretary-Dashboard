const express = require("express");
const { getDoorcodes, getDoorcode, addDoorcode, updateDoorcode, deleteDoorcode } = require("../controllers/doorcodeController");

const router = express.Router();

router.get("/", getDoorcodes);
router.get("/:id", getDoorcode);
router.post("/", addDoorcode);
router.put("/:id", updateDoorcode);
router.delete("/:id", deleteDoorcode);

module.exports = router;
