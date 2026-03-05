import Patient from "../Models/Patient.js";
import Report from "../Models/Report.js";
import Prescription from "../Models/Prescription.js";
import ScanReport from "../Models/ScanReport.js";
import LabReport from "../Models/LabReport.js";
import Bill from "../Models/Bill.js";
import Doctor from "../Models/Doctor.js";
import { generatePDF } from "../Helpers/pdfGenerator.js";

/**
 * Get full medical history for a patient (Public Verification)
 * This endpoint is designed for the verification portal and returns only 
 * verification-essential data.
 */
export const getPatientHistory = async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!patientId) {
            return res.status(400).json({ success: false, message: "Patient ID is required" });
        }

        const [patient, reports, prescriptions, scanReports, labReports, bills] = await Promise.all([
            Patient.findById(patientId)
                .populate("assignedDoctor", "name specialization")
                .select("name age gender bloodGroup mrn createdAt phone email address emergencyContact history nextAppointment")
                .lean(),
            Report.find({ patient: patientId })
                .populate("doctor", "name specialization")
                .select("reportTitle symptoms diagnosis date treatmentAdvice reportDetails")
                .sort({ date: -1 })
                .lean(),
            Prescription.find({ patient: patientId })
                .populate("doctor", "name specialization")
                .select("medicines symptoms diagnosis createdAt notes followUpDate")
                .sort({ createdAt: -1 })
                .lean(),
            ScanReport.find({ patient: patientId })
                .populate("doctor", "name")
                .select("scanName type resultStatus findings impression scanDate reportGeneratedDate pdfFile")
                .sort({ scanDate: -1 })
                .lean(),
            LabReport.find({ patient: patientId })
                .populate("doctor", "name")
                .select("testName testType resultStatus resultDetails testDate reportGeneratedDate referenceRange pdfFile")
                .sort({ testDate: -1 })
                .lean(),
            Bill.find({ patient: patientId })
                .populate("doctor", "name")
                .select("treatment amount createdAt pdfFile paid")
                .sort({ createdAt: -1 })
                .lean()
        ]);

        if (!patient) {
            return res.status(404).json({ success: false, message: "Patient not found" });
        }

        // Consolidated Documents List
        const documents = [];
        if (bills) bills.forEach(b => { if (b.pdfFile) documents.push({ name: `Bill - ${b.treatment}`, url: b.pdfFile, date: b.createdAt, type: 'pdf' }); });
        if (scanReports) scanReports.forEach(s => { if (s.pdfFile) documents.push({ name: `Scan - ${s.scanName}`, url: s.pdfFile, date: s.scanDate, type: 'pdf' }); });
        if (labReports) labReports.forEach(l => { if (l.pdfFile) documents.push({ name: `Lab - ${l.testName}`, url: l.pdfFile, date: l.testDate, type: 'pdf' }); });

        res.status(200).json({
            success: true,
            patient: { ...patient, documents },
            history: {
                reports,
                prescriptions,
                scanReports,
                labReports,
                bills
            }
        });
    } catch (error) {
        console.error("Public History Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching patient history",
            error: error.message
        });
    }
};

/**
 * Public PDF Viewer / Downloader
 * Generates or fetches PDF for reports, prescriptions, scans, and labs.
 */
export const publicDownloadPdf = async (req, res) => {
    try {
        const { type, id } = req.params;
        let docData = {};

        // 1. Fetch the main document
        let document;
        let patientId;
        let doctorId;

        switch (type) {
            case 'report':
                document = await Report.findById(id).lean();
                if (!document) throw new Error("Report not found");
                docData.report = document;
                patientId = document.patient;
                doctorId = document.doctor;
                docData.date = document.date;
                break;
            case 'prescription':
                document = await Prescription.findById(id).lean();
                if (!document) throw new Error("Prescription not found");
                docData.prescription = document;
                patientId = document.patient;
                doctorId = document.doctor;
                docData.date = document.createdAt;
                break;
            case 'scan-report':
                document = await ScanReport.findById(id).lean();
                if (!document) throw new Error("Scan Report not found");
                docData.scanReport = document;
                patientId = document.patient;
                doctorId = document.doctor;
                docData.date = document.scanDate;
                break;
            case 'lab-report':
                document = await LabReport.findById(id).lean();
                if (!document) throw new Error("Lab Report not found");
                docData.labReport = document;
                patientId = document.patient;
                doctorId = document.doctor;
                docData.date = document.testDate;
                break;
            case 'bill':
                document = await Bill.findById(id).lean();
                if (!document) throw new Error("Bill not found");
                docData.billId = document._id;
                docData.billItems = document.billItems;
                docData.paymentMode = document.paymentMode;
                patientId = document.patient;
                doctorId = document.doctor;
                docData.date = document.createdAt;
                break;
            default:
                return res.status(400).json({ success: false, message: "Invalid document type" });
        }

        // 2. Fetch associated Patient & Doctor data for the PDF header/profile
        if (patientId) {
            docData.patient = await Patient.findById(patientId).lean();
        }
        if (doctorId) {
            docData.doctor = await Doctor.findById(doctorId).select("-password").lean();
        }

        // 3. Generate PDF
        const fileName = `${type}_${id}.pdf`;
        const { buffer } = await generatePDF(docData, fileName);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename=${fileName}`,
            "Content-Length": buffer.length,
        });

        res.send(buffer);

    } catch (error) {
        console.error("Public PDF Generation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error generating document PDF",
            error: error.message
        });
    }
};
