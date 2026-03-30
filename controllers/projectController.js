import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Project from "../models/project.js";
import ErrorHadler from "../utils/errorHandler.js";
import User from "../models/user.js";

// // CREATE NEW PROJECT (Admin Only)
export const createProject = catchAsyncErrors(async (req, res, next) => {
    const { title, budget, client, status, startDate } = req.body;

    if (!title || !budget || !client) {
        return next(new ErrorHadler(400, "Please provide a title, budget, and client ID"));
    }

    // 3. Verify that the client actually exists in your database
    const userExists = await User.findById(client);
    if (!userExists) {
        return next(new ErrorHadler(404, "Client not found. Cannot assign project to a non-existent user."));
    }

    // 4. Create the project
    // .create() automatically saves it to the database, so we don't need .save() here
    const project = await Project.create({
        title,
        budget,
        client,
        status: status || "In Progress", // Use provided status, or default to "In Progress"
        startDate: startDate || Date.now()
    });

    // 5. Send back a 201 (Created) success response
    res.status(201).json({
        success: true,
        message: "Project created successfully",
        project
    });
});


// UPDATE PROJECT - Admin => /api/va/project/update
export const updateProject = catchAsyncErrors(async (req, res, next) => {
    const { status, budget, title } = req.body;

    // Find the project by its ID
    let project = await Project.findById(req.params.id);

    if (!project) {
        return next(new ErrorHadler(404, "Project not found"));
    }

    // Update the fields ONLY if they are explicitly provided
    if (status !== undefined) project.status = status;
    if (budget !== undefined) project.budget = budget;
    if (title !== undefined) project.title = title;

    // Save the updated project
    await project.save();

    res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project
    });
});