import express from "express";
import { isAuthenticatedUser, authorizeRole } from "../middlewares/auth.js"; 
import { createProject, getAllProjects, getMyProjects, updateProject } from "../controllers/projectController.js";

const router = express.Router();


router.route("/admin/project/create").post(isAuthenticatedUser, authorizeRole('admin'),createProject);
router.route("/admin/project/update/:id").put(isAuthenticatedUser, authorizeRole('admin'), updateProject);
router.route("/admin/projects").get(isAuthenticatedUser,authorizeRole('admin'), getAllProjects);
router.route("/my-projects").get(isAuthenticatedUser, getMyProjects);


export default router;