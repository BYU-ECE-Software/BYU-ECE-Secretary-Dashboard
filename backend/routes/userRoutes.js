import express from "express";
import {
  createUser,
  deleteUser,
  getUsers,
  searchUsers,
  updateUser,
  getUserDeleteCheck,
  deleteUsersBulk,
} from "../controllers/userController.js";

const router = express.Router();

// POST /user - creates a new user
router.post("/", createUser);

// GET /user - fetch all users
router.get("/", getUsers);

// GET /user/search - searches for specific users by name or email
router.get("/search", searchUsers);

// GET /user/:id/delete-check
router.get("/:id/delete-check", getUserDeleteCheck);

// PUT /user/:id - edit a user
router.put("/:id", updateUser);

// DELETE /user/bulk-delete - bulk delete users (body: { ids: [1,2,3] })
router.delete("/bulk-delete", deleteUsersBulk);

// DELETE /user/:id - delete a single user
router.delete("/:id", deleteUser);

export default router;
