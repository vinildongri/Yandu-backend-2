import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";



// Get Current user profile => /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id);

    res.status(200).json({
        user,
    });
});

// Update User Profile =>/api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        user,
    });
})

// Update Password => /api/v1/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id).select("+password");

    // Check previous Passsword
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("old Password is Incorrect", 400));
    }

    user.password = req.body.password;
    await user.save();

    res.status(200).json({
        success: true,
    });
});


// Get all users - ADMIN => /api/v1/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        users,
    });
});

// Get User Details - ADMIN => /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorHandler(`Uaer not found with this id: ${req.params.id} `, 404));
    }

    res.status(200).json({
        user,
    });
});

// Update User Details - ADMIN => /api/v1/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
    });

    await user.save();

    res.status(200).json({
        user,
    });
});

// Delete User - ADMIN => /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User not found with this id: ${req.params.id}`, 404));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
    });
});