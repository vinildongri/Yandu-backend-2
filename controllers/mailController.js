import transporter from "../config/mailConfig.js";

export const sendContactMail = async (req, res) => {
    const { name, email, mobile, subject, message } = req.body;

    // 1. Check if fields exist
    if (!name || !email || !mobile || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

    // 2. Validate Email Format (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format! (e.g., user@example.com)"
        });
    }

    // Optional: Validate Mobile (e.g., must be 10 digits)
    if (mobile.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Mobile number must be at least 10 digits"
        });
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email, // If this is "john", reply won't work
            subject: subject,
            html: `
                <h2>📩 New Yandu Contact</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully"
        });

    } catch (error) {
        console.error("Mail Error ❌:", error);
        return res.status(500).json({
            success: false,
            message: "Email sending failed"
        });
    }
};