import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import crypto from "crypto";



//  Resgister User => /api/v1/register
// export const registerUser = catchAsyncErrors(async (req, res, next) => {
//     const { name, email, password } = req.body;

//     const user = await User.create({
//         name, email, password
//     });

//     sendToken(user, 201, res);
// });



export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password
    });

    // Generate the unhashed OTP
    const otp = user.getOTP();

    // Save the user to store the hashed OTP and trigger the TTL expiration timer
    await user.save({ validateBeforeSave: false });

    const message = `Hi ${user.name},\n\nYour account verification code is: ${otp}\n\nThis code is valid for 15 minutes.`;

    try {
        // 4. Send the email
        await sendEmail({
            email: user.email,
            subject: "Your Account Verification Code",
            message
        });

        res.status(200).json({
            success: true,
            message: `An OTP has been sent to ${user.email}. Please verify within 15 minutes.`
        });

    } catch (error) {
        // If the email fails, wipe the OTP so they can try again
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});

export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return next(new ErrorHandler("Please provide your email and the OTP", 400));
    }

    // 1. Hash the OTP provided by the user
    const hashedOTP = crypto
        .createHash("sha256")
        .update(otp.toString())
        .digest("hex");

    // 2. Find the user with this email, matching OTP, and check if it's still valid
    const user = await User.findOne({
        email,
        otp: hashedOTP,
        otpExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("The OTP is invalid or has expired.", 400));
    }

    // Crucial: Setting otpExpire to undefined stops MongoDB from auto-deleting the user!
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
});


export const resendOTP = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please enter your email", 400));
    }

    const user = await User.findOne({ email });

    //  Handle edge case: User doesn't exist or was deleted by MongoDB TTL
    if (!user) {
        return next(new ErrorHandler("User not found or registration expired. Please register again.", 404));
    }

    // Handle edge case: User is already verified
    if (user.isVerified) {
        return next(new ErrorHandler("This account is already verified. Please log in.", 400));
    }

    //  Generate a brand new OTP using your existing schema method
    const otp = user.getOTP();

    //  Save the user. This updates the OTP and resets the 15-minute TTL timer in the DB!
    await user.save({ validateBeforeSave: false });

    const message = `Hi ${user.name},\n\nYour new account verification code is: ${otp}\n\nThis code is valid for 15 minutes.`;

    try {
        // 6. Send the new email
        await sendEmail({
            email: user.email,
            subject: "Your New Verification Code",
            message
        });

        res.status(200).json({
            success: true,
            message: `A new OTP has been sent to ${user.email}.`
        });

    } catch (error) {
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});


// Login User => /api/v1/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Pleaae enter email & Password", 400));
    }

    // Find user in database
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Check if Password is correct
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    // --- NEW GUARDRAIL: Check if the user is verified ---
    if (!user.isVerified) {
        return next(new ErrorHandler("Please verify your email using the OTP sent to your inbox before logging in.", 403));
    }

    sendToken(user, 201, res);

});


// Logout User => /api/v1/logout 
export const logout = catchAsyncErrors(async (req, res, next) => {
    const isProd = process.env.NODE_ENV === "PRODUCTION";

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
    });

    res.status(200).json({
        message: "Logged Out Successfully!",
    });
});



// Forgot Password => /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    // Find user in the DataBase
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("user not found with this Email", 401));
    }

    const resetToken = await user.getResetPasswordToken();
    // console.log("resetToken: " + resetToken);

    await user.save();

    // Create Reset password Url
    const resetUrl = `${process.env.FRONTEND_URL}/password/reset?token=${resetToken}`;
    // console.log("resetUrl: " + resetUrl);


    const message = getResetPasswordTemplate(user?.name, resetUrl);

    // console.log("🔗 Reset URL:", resetUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "Yandu Password Recovery",
            message,
        });

        res.status(200).json({
            message: `Email sent to ${user.email}`,
        });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return next(new ErrorHandler(error.message, 500));
    }

});


// Reset Password => /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    // Hash the Url Token
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Password Reset Token id Invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400));
    }

    // Set new Password 
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
});