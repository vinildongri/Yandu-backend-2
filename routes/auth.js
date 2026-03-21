import express from "express";
import { allUsers, deleteUser, forgotPassword, getUserDetails, getUserProfile, loginUser, logout, registerUser, resetPassword, updatePassword, updateProfile, updateUser } from "../controllers/authControllers.js";
import { authorizeRole, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(isAuthenticatedUser, logout);

router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router
    .route("/admin/users")
    .get(isAuthenticatedUser, authorizeRole('admin'), allUsers);


router
    .route("/admin/users/:id")
    .get(isAuthenticatedUser, authorizeRole('admin'), getUserDetails)
    .put(isAuthenticatedUser, authorizeRole('admin'), updateUser)
    .delete(isAuthenticatedUser, authorizeRole('admin'), deleteUser); 

export default router;