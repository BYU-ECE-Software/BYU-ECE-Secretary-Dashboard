import express from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  searchUsers,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

// POST /user - creates a new user
router.post("/", createUser);

// GET /user - fetch all users
router.get("/", getUsers);

// GET /user/search - searches for specific users by name or email
router.get("/search", searchUsers);

// PUT /user - edit a user
router.put("/:id", updateUser);

// DELETE /user - delete a user
router.delete("/:id", deleteUser);

export default router;
