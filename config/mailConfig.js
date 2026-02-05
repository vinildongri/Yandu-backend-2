import nodemailer from "nodemailer";
import dotenv from "dotenv"; // Import dotenv here

// Load env vars specifically for this file's context
dotenv.config(); 

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify SMTP on startup
transporter.verify((err, success) => {
    if (err) {
        console.error("SMTP CONFIG ERROR ❌", err);
    } else {
        console.log("SMTP READY ✅");
    }
});

export default transporter;