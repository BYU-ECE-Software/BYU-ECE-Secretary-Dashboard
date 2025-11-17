import express from "express";
import {
  createKey,
  deleteKey,
  getKeys,
  getKeyByNumber,
  updateKey,
} from "../controllers/keyController.js";

const router = express.Router();

// POST /key - creates a new key
router.post("/", createKey);

// GET /key - fetch all keys
router.get("/", getKeys);

// GET /key/:number - fetch single key by number
router.get("/:number", getKeyByNumber);

// PUT /key - edit a key
router.put("/:number", updateKey);

// DELETE /key - delete a key
router.delete("/:number", deleteKey);

export default router;
