import express from "express";
import { processCompany } from "../report-engine/reportPipeline.service.js";

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { company, companyName } = req.body;

        const result =
            await processCompany(companyName || company);

        res.json(result);

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            error: err.message

        });

    }

});

export default router;
