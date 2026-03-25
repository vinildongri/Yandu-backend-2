import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [50, "Your name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address"
        ]
    },
    password: {
        type: String,
        minLength: [8, "Your password must be longer than 8 characters"],
        select: false,
    },
    // Essential for protecting your admin dashboard
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    // Tracks if they used email/password or a social login
    authProvider: {
        type: String,
        default: 'email'
    },
    companyName: {
        type: String,
        trim: true
    },
    profilePicture: {
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

//  Encrypiting Password Before Savaving the user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        // next();
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// Return JWT Token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME,
    });
};

// Compare user Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Reset Password token
userSchema.methods.getResetPasswordToken = async function () {
    // Generate Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // hash and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // set Token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken;
};

export default mongoose.models.User || mongoose.model("User", userSchema);