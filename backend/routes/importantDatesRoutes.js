import express from "express";
import {
  createImportantDate,
  getDates,
  updateDate,
  deleteDate,
} from "../controllers/importantDatesController.js";

const router = express.Router();

// POST /date - creates a new important date
router.post("/", createImportantDate);

// GET /date - fetch all important dates
router.get("/", getDates);

// PUT /date - edit a date
router.put("/:id", updateDate);

// DELETE /date - delete a date
router.delete("/:id", deleteDate);

export default router;
