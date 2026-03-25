import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import contactRoutes from "./routes/contact.js";
import errorMiddleware from "./middlewares/errors.js"
import authRoutes from "./routes/auth.js";
import { connectDatabase } from "./config/dbConnect.js";


// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down Server due to Uncaught Exception");
    process.exit(1);
});

dotenv.config();
const app = express();
app.use(cookieParser()); 
connectDatabase();

// app.use(cors());
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true
}));
app.use(express.json());

app.use("/api/v1", contactRoutes);
app.use("/api/v1", authRoutes);

// Using Error Middleware
app.use(errorMiddleware); 

app.listen(process.env.PORT, () => {
    console.log(
        `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
});


// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
    console.log(`ERROR: ${err}`);
    console.log("Shutting down Server due to Unhandled Promise Rejection");
    server.close(() => {
        process.exit(1);
    });
});
