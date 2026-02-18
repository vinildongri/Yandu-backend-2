import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import contactRoutes from "./routes/contact.js";

dotenv.config();

const app = express();

app.use(cors());
// app.use(cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));
app.use(express.json());

app.use("/api/v1", contactRoutes);

app.listen(process.env.PORT, () => {
    console.log(
        `Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`
    );
});
