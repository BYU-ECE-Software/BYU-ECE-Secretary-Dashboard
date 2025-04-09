const express = require("express");
const { getLockers, getLocker, addLocker, updateLocker, deleteLocker } = require("../controllers/lockerController");

const router = express.Router();

router.get("/", getLockers);
router.get("/:id", getLocker);
router.post("/", addLocker);
router.put("/:id", updateLocker);
router.delete("/:id", deleteLocker);

module.exports = router;
