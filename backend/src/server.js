import express from "express";
import dotenv from "dotenv";
import discoverRouter from "./routes/discover.js";
import reportsRouter from "./routes/reports.js";
import insightsRouter from "./routes/insights.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

function captureRawBody(req, _res, buf, encoding) {
    if (buf && buf.length) {
        req.rawBody = buf.toString(encoding || "utf8");
    }
}

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

app.use(express.json({ limit: "2mb", verify: captureRawBody }));
app.use("/discover", discoverRouter);
app.use("/reports", reportsRouter);
app.use("/insights", insightsRouter);

app.use((err, req, res, next) => {
    console.error("Express error handler:", err);
    if (req.rawBody) {
        console.error("Raw request body:", req.rawBody);
    }
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: err.message || "Internal server error" });
});

app.get("/health", (_, res) => {
    res.json({
        ok: true,
        service: "lead-discovery-poc",
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

