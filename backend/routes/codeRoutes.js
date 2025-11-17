import express from "express";
import {
  createCode,
  deleteCode,
  getCodes,
  updateCode,
} from "../controllers/codeController.js";

const router = express.Router();

// POST /code - creates a new code
router.post("/", createCode);

// GET /code - fetch all codes
router.get("/", getCodes);

// PUT /code - edit a code
router.put("/:id", updateCode);

// DELETE /code - delete a code
router.delete("/:id", deleteCode);

export default router;
