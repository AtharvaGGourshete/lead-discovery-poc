import express from "express";
import { discoverLeads } from "../services/discovery.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const leads = await discoverLeads();
    res.json(leads);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
