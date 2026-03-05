import express from "express";
import { getPatientHistory } from "../Controllers/publicController.js";

const router = express.Router();

// GET /api/public/patient-history/:patientId
router.get("/patient-history/:patientId", getPatientHistory);

// GET /api/public/view-pdf/:type/:id
import { publicDownloadPdf } from "../Controllers/publicController.js";
router.get("/view-pdf/:type/:id", publicDownloadPdf);

export default router;
