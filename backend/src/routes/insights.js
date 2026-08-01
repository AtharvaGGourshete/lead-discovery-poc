import express from "express";
import { processCompany } from "../report-engine/reportPipeline.service.js";

const router = express.Router();

router.post("/company", async (req, res) => {
  console.log("/insights/company request body:", req.body);

  try {
    const { company, companyName } = req.body;
    const result = await processCompany(companyName || company);
    console.log("/insights/company result keys:", Object.keys(result || {}));
    res.json(result);
  } catch (err) {
    console.error("/insights/company error:", err);
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;
