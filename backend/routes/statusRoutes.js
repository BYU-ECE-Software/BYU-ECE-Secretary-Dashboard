import express from "express";
import {
  createStatus,
  deleteStatus,
  getStatuses,
  updateStatus,
} from "../controllers/statusController.js";

const router = express.Router();

// POST /status - creates a new status
router.post("/", createStatus);

// GET /status - fetch all status
router.get("/", getStatuses);

// PUT /status - edit a status
router.put("/:id", updateStatus);

// DELETE /status - delete a status
router.delete("/:id", deleteStatus);

export default router;
