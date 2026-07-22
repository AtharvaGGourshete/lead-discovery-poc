import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import discoverRouter from "./routes/discover.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/discover", discoverRouter);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});