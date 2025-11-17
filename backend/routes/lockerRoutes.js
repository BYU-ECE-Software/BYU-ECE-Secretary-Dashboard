import express from "express";
import {
  createLocker,
  deleteLocker,
  getLockers,
  updateLocker,
} from "../controllers/lockerController.js";

const router = express.Router();

// POST /locker - creates a new locker
router.post("/", createLocker);

// GET /locker - fetch all lockers
router.get("/", getLockers);

// PUT /locker - edit a locker
router.put("/:number", updateLocker);

// DELETE /locker - delete a locker
router.delete("/:number", deleteLocker);

export default router;
