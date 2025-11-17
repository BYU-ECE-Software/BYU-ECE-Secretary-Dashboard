import express from "express";
import {
  createDesk,
  deleteDesk,
  getDesks,
  updateDesk,
} from "../controllers/deskController.js";

const router = express.Router();

// POST /desk - creates a new desk
router.post("/", createDesk);

// GET /desk - fetch all desks
router.get("/", getDesks);

// PUT /desk - edit a desk
router.put("/:number", updateDesk);

// DELETE /desk - delete a desk
router.delete("/:number", deleteDesk);

export default router;
