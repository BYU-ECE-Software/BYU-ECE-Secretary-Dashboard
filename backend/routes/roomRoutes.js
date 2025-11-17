import express from "express";
import {
  createRoom,
  deleteRoom,
  getRooms,
  updateRoom,
} from "../controllers/roomController.js";

const router = express.Router();

// POST /room - creates a new room
router.post("/", createRoom);

// GET /room - fetch all rooms
router.get("/", getRooms);

// PUT /room - edit a room
router.put("/:id", updateRoom);

// DELETE /room - delete a room
router.delete("/:id", deleteRoom);

export default router;
