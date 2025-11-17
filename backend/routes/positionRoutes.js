import express from "express";
import {
  createPosition,
  deletePosition,
  getPositions,
  updatePosition,
} from "../controllers/positionController.js";

const router = express.Router();

// POST /position - creates a new position
router.post("/", createPosition);

// GET /position - fetch all positions
router.get("/", getPositions);

// PUT /position - edit a position
router.put("/:id", updatePosition);

// DELETE /position - delete a position
router.delete("/:id", deletePosition);

export default router;
