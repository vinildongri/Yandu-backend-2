import express from "express";
import { sendContactMail } from "../controllers/mailController.js";

const router = express.Router();

router.post("/send/mail", sendContactMail);

export default router;
