import express from "express";
import { isAuthenticatedUser, authorizeRole } from "../middlewares/auth.js"; 
import { createProject, updateProject } from "../controllers/projectController.js";

const router = express.Router();


router.route("/project/create").post(isAuthenticatedUser, authorizeRole('admin'),createProject);
router.route("/project/:id").put(isAuthenticatedUser, authorizeRole('admin'), updateProject);

export default router;