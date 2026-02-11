import transporter from "../config/mailConfig.js";

export const sendContactMail = async (req, res) => {
    const { name, email, mobile, company, services, message } = req.body;

    // 2. Check required fields (Company and Services are optional)
    if (!name || !email || !mobile || !message) {
        return res.status(400).json({
            success: false,
            message: "Name, Email, Mobile, and Message are required!"
        });
    }

    // 3. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format!"
        });
    }

    // 4. Validate Mobile (Basic length check)
    if (mobile.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Mobile number must be at least 10 digits"
        });
    }

    // 5. Format Services for the email (Handle array or empty string)
    const servicesList = Array.isArray(services) && services.length > 0
        ? services.join(", ")
        : "No specific services selected";

    // 6. Define the Email Subject automatically
    const mailSubject = `New Project Inquiry from ${name}`;

    try {
        // Get current date for the footer
        const date = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        await transporter.sendMail({
            from: `"Yandu System" <${process.env.EMAIL_USER}>`, // Professional Sender Name
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `[New Lead] ${name} - ${company || "Individual"}`, // Clear, sortable subject line
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Lead Notification</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            
                            <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                                
                                <tr>
                                    <td style="background-color: #0f172a; padding: 30px 40px; text-align: center;">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">YANDU</h1>
                                        <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px; letter-spacing: 1px;">DIGITAL SOLUTIONS</p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 40px;">
                                        
                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                            <tr>
                                                <td>
                                                    <span style="background-color: #ecfdf5; color: #047857; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; border: 1px solid #a7f3d0;">
                                                        🚀 NEW PROJECT INQUIRY
                                                    </span>
                                                </td>
                                                <td align="right" style="color: #64748b; font-size: 12px;">
                                                    ${date}
                                                </td>
                                            </tr>
                                        </table>

                                        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin: 0 0 24px 0;">Client Details</h2>

                                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                                            <tr>
                                                <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; width: 50%; background-color: #f8fafc;">
                                                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Full Name</p>
                                                    <p style="margin: 4px 0 0 0; color: #0f172a; font-weight: 600;">${name}</p>
                                                </td>
                                                <td style="padding: 16px; border-bottom: 1px solid #e2e8f0; width: 50%; background-color: #f8fafc;">
                                                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Company</p>
                                                    <p style="margin: 4px 0 0 0; color: #0f172a; font-weight: 600;">${company || "—"}</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 16px; border-right: 1px solid #e2e8f0; background-color: #ffffff;">
                                                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Email Address</p>
                                                    <a href="mailto:${email}" style="margin: 4px 0 0 0; color: #4f46e5; text-decoration: none; display: block; font-weight: 500;">${email}</a>
                                                </td>
                                                <td style="padding: 16px; background-color: #ffffff;">
                                                    <p style="margin: 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Mobile</p>
                                                    <a href="tel:${mobile}" style="margin: 4px 0 0 0; color: #0f172a; text-decoration: none; display: block; font-weight: 500;">${mobile}</a>
                                                </td>
                                            </tr>
                                        </table>

                                        <div style="margin-top: 32px;">
                                            <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">Requested Services</p>
                                            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; border-left: 4px solid #4f46e5;">
                                                <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.5;">${servicesList}</p>
                                            </div>
                                        </div>

                                        <div style="margin-top: 32px;">
                                            <p style="margin: 0 0 12px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px;">The Brief</p>
                                            <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                                                <p style="margin: 0; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                                            </div>
                                        </div>

                                        <div style="margin-top: 40px; text-align: center;">
                                            <a href="mailto:${email}?subject=Re: Project Inquiry via Yandu" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Reply to Client</a>
                                        </div>

                                    </td>
                                </tr>

                                <tr>
                                    <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                                            This is an automated notification from the <strong>Yandu Contact System</strong>.
                                        </p>
                                        <p style="margin: 8px 0 0 0; font-size: 11px; color: #cbd5e1;">
                                            &copy; ${new Date().getFullYear()} Yandu Digital. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin-top: 16px; font-size: 10px; color: #cbd5e1; text-align: center;">
                                ID: ${Date.now().toString(36)} • IP: ${req.ip}
                            </p>

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
        console.error("Mail Error ❌:", error);
        return res.status(500).json({
            success: false,
            message: "Email sending failed"
        });
    }
};