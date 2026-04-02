import express from "express";
import { sendContactMail } from "../controllers/mailController.js";
// import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.route("/send/mail").post(sendContactMail);

export default router;
