import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    // Link this project to a specific user (the client)
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a project title'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'In Progress'
    },
    // Store budget as a Number for easy math (Total Spent calculations)
    // You can format it with the ₹ symbol on the frontend
    budget: {
        type: Number,
        required: [true, 'Please provide a project budget']
    },
    startDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Use ES Module export instead of module.exports
export default mongoose.model('Project', projectSchema);