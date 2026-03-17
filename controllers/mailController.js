import transporter from "../config/mailConfig.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

export const sendContactMail = catchAsyncErrors(async (req, res, next) => {
    const { name, email, mobile, company, services, message } = req.body;

    // ✅ Required fields check
    if (!name || !email || !mobile || !message) {
        return next(new ErrorHandler("Name, Email, Mobile, and Message are required!", 400));
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new ErrorHandler("Invalid email format!", 400));
    }

    // ✅ Mobile validation
    if (mobile.length < 10) {
        return next(new ErrorHandler("Mobile number must be at least 10 digits", 400));
    }

    // ✅ Services formatting
    const servicesList = Array.isArray(services) && services.length > 0
        ? services.join(", ")
        : "No specific services selected";

    const date = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    // ✅ Optional: attach logged-in user info
    const userInfo = req.user ? `(User ID: ${req.user._id})` : "Guest User";

    try {
        await transporter.sendMail({
            from: `"Yandu System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `[New Lead] ${name} - ${company || "Individual"}`,
            html: `
                <h2>🚀 New Project Inquiry</h2>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mobile:</strong> ${mobile}</p>
                <p><strong>Company:</strong> ${company || "—"}</p>
                <p><strong>Services:</strong> ${servicesList}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr/>
                <p><strong>Source:</strong> ${userInfo}</p>
                <p><strong>IP:</strong> ${req.ip}</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully"
        });

    } catch (error) {
        return next(new ErrorHandler("Email sending failed", 500));
    }
});