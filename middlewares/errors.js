import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
    let error = {
        statusCode: err?.statusCode || 500,
        message: err?.message || "Internal Server Error"
    };

    // Check for MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        error = new ErrorHandler(`Email "${value}" is already registered.`, 400);
    }

    // Handle wrong Jwt Error
    if (err.name === "jwtWebTokenError") {
        const message = "JASON Web Token is Invalid, Try Again!!!";
        error = new ErrorHandler(message, 400);
    }

    // Handle expires jwt Error
    if (err.name === "TokenExpiredError") {
        const message = "JASON Web Token is Expired, Try Again!!!";
        error = new ErrorHandler(message, 400);
    } 

    if (process.env.NODE_ENV === "DEVELOPMENT") {
        res.status(error.statusCode).json({
            message: error.message,
            error: err,
            stack: err?.stack
        });
    }

    if (process.env.NODE_ENV === "PRODUCTION") {
        res.status(error.statusCode).json({
            message: error.message,
        });
    }
};