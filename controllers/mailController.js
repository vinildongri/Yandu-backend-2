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
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
                </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f8fafc; padding: 40px 20px;">
                    <tr>
                        <td align="center">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                
                                <tr>
                                    <td align="center" style="background-color: #0f172a; padding: 32px 24px;">
                                        <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">Yandu.</h1>
                                        <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">New Project Inquiry</p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 32px 32px 16px 32px;">
                                        <h2 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 24px 0;">Lead Details</h2>
                                        
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; width: 35%; color: #64748b; font-size: 14px; font-weight: 500;">Name</td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; font-weight: 500;">Email</td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #3b82f6; font-size: 14px; font-weight: 600;"><a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; font-weight: 500;">Phone</td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${mobile}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; font-weight: 500;">Company</td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${company || "—"}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 14px; font-weight: 500;">Services</td>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 14px; font-weight: 600;">${servicesList}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 0 32px 32px 32px;">
                                        <h2 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">The Brief</h2>
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 20px; border-radius: 0 8px 8px 0;">
                                                    <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="background-color: #f1f5f9; padding: 24px 32px; border-top: 1px solid #e2e8f0;">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="color: #64748b; font-size: 12px; line-height: 1.5;">
                                                    <strong>Timestamp:</strong> ${date}<br>
                                                    <strong>Source:</strong> ${userInfo}<br>
                                                    <strong>IP Address:</strong> ${req.ip}
                                                </td>
                                                <td align="right" style="color: #94a3b8; font-size: 12px; vertical-align: bottom;">
                                                    System Generated
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                            </table>
                            </td>
                    </tr>
                </table>
            </body>
            </html>
            `
        });

        return res.status(200).json({
            success: true,
            message: "Message sent successfully"
        });

    } catch (error) {
        // Log the actual error for your backend records before sending the generic response
        console.error("Mail Error:", error);
        return next(new ErrorHandler("Email sending failed", 500));
    }
});