import Bill from "../Models/Bill.js";
import Patient from "../Models/Patient.js";
import Doctor from "../Models/Doctor.js";
import Prescription from "../Models/Prescription.js";
import Report from "../Models/Report.js";
import ScanReport from "../Models/ScanReport.js";
import mongoose from "mongoose";
import Biller from "../Models/Biller.js";
import { generatePDF } from "../Helpers/pdfGenerator.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import LabReport from "../Models/LabReport.js";
import fs from "fs";
import FormData from "form-data";

// -------------------------------------------------
// 9️⃣ GET ALL PATIENTS (Dropdown)
// -------------------------------------------------
export const getBillerPatients = async (req, res) => {
  try {
    const patients = await Patient.find({}, "name gender age phone patientType assignedDoctor mrn");
    res.status(200).json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 🔟 GET ALL DOCTORS (Dropdown)
// -------------------------------------------------
export const getBillerDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name specialization phone consultationFee");
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣1️⃣ GET LATEST PRESCRIPTION FOR PATIENT
// -------------------------------------------------
export const getLatestPrescription = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescription = await Prescription.findOne({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(1);

    res.status(200).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣1️⃣.5️⃣ GET LATEST REPORT FOR PATIENT
// -------------------------------------------------
export const getLatestReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const report = await Report.findOne({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(1);

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// (Removed old function)
export const loginBiller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const biller = await Biller.findOne({ email });
    if (!biller) return res.status(404).json({ message: "Biller not found" });

    const isMatch = await bcrypt.compare(password, biller.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: biller._id, role: biller.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      biller: {
        id: biller._id,
        name: biller.name,
        email: biller.email,
        role: biller.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------------------------------------
// 2️⃣ CREATE BILL (NO PDF YET)
// -------------------------------------------------
export const createBill = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      patientName,
      isWod,
      treatment,
      billItems = [],
      prescriptionId,
      reportId,
      scanReportIds = [], // Array of IDs
      labReportIds = [], // Array of Lab IDs
      paymentMode
    } = req.body;

    if ((!patientId && !patientName) || !treatment || billItems.length === 0) {
      return res.status(400).json({ message: "Required fields missing (Patient or Treatment)" });
    }

    // ✅ AUTO CALCULATE TOTAL
    const amount = billItems.reduce(
      (sum, item) => sum + item.charge * item.qty,
      0
    );

    const bill = await Bill.create({
      patient: patientId || null,
      doctor: doctorId || null,
      patientName: patientName || null,
      isWod: isWod || false,
      treatment,
      billItems,
      amount,
      prescription: prescriptionId || null,
      report: reportId || null,
      scanReports: scanReportIds, // Save array
      labReports: labReportIds,
      paymentMode: paymentMode || "Cash",
      paid: true // ✅ Auto-complete bill status
    });

    // ✅ MARK SCAN REPORTS AS BILLED
    if (scanReportIds.length > 0) {
      await ScanReport.updateMany(
        { _id: { $in: scanReportIds } },
        { $set: { isBilled: true } }
      );
    }

    // ✅ MARK LAB REPORTS AS BILLED
    if (labReportIds.length > 0) {
      await LabReport.updateMany(
        { _id: { $in: labReportIds } },
        { $set: { isBilled: true } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// -------------------------------------------------
// 1️⃣2️⃣ GET UNBILLED SCAN REPORTS FOR PATIENT
// -------------------------------------------------
export const getUnbilledScanReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await ScanReport.find({
      patient: patientId,
      isBilled: { $ne: true }, // Include false or missing
      cost: { $gt: 0 } // Only fetch if chargeable
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣2️⃣.5️⃣ GET UNBILLED LAB REPORTS FOR PATIENT
// -------------------------------------------------
export const getUnbilledLabReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await LabReport.find({
      patient: patientId,
      isBilled: { $ne: true }, // Include false or missing
      cost: { $gt: 0 } // Only fetch if chargeable
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// -------------------------------------------------
// 1️⃣2️⃣.7️⃣ GET ALL SCAN REPORTS FOR PATIENT (Billed + Unbilled)
// -------------------------------------------------
export const getAllScanReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await ScanReport.find({ patient: patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣2️⃣.8️⃣ GET ALL LAB REPORTS FOR PATIENT (Billed + Unbilled)
// -------------------------------------------------
export const getAllLabReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await LabReport.find({ patient: patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣2️⃣.9️⃣ GET ALL PRESCRIPTIONS FOR PATIENT
// -------------------------------------------------
export const getAllPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const prescriptions = await Prescription.find({ patient: patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣3️⃣.0️⃣ GET ALL BILLS FOR SPECIFIC PATIENT
// -------------------------------------------------
export const getPatientBills = async (req, res) => {
  try {
    const { patientId } = req.params;
    const bills = await Bill.find({ patient: patientId })
      .populate("doctor", "name specialization")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣3️⃣.1️⃣ GET ALL DOCTOR REPORTS FOR SPECIFIC PATIENT
// -------------------------------------------------
export const getAllReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await Report.find({ patient: patientId })
      .populate("doctor", "name specialization")
      .sort({ date: -1 });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const generateBillPDF = async (req, res) => {
  try {
    const { billId } = req.body;

    const bill = await Bill.findById(billId)
      .populate("patient")
      .populate("doctor")
      .populate("prescription")
      .populate("report")
      .populate("prescription")
      .populate("report")
      .populate("scanReports")
      .populate("labReports");

    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Ensure we handle missing patient/doctor data gracefully
    const patientData = bill.patient || {};
    const doctorData = bill.doctor || {};

    // ------------------------------
    // FULL PATIENT OBJECT FOR PDF
    // ------------------------------
    const pdfData = {
      billId: bill._id.toString(),
      date: new Date().toLocaleDateString("en-IN"),

      // FULL PATIENT DETAILS
      patient: {
        id: patientData._id?.toString() || "N/A",
        name: patientData.name || "Unknown Patient",
        age: patientData.age || "-",
        gender: patientData.gender || "-",
        phone: patientData.phone || "-",
        email: patientData.email || "-",

        patientType: patientData.patientType || "-",
        bloodGroup: patientData.bloodGroup || "-",
        mrn: patientData.mrn || "-",

        address: {
          line1: patientData.address?.line1 || "-",
          line2: patientData.address?.line2 || "-",
          city: patientData.address?.city || "-",
          state: patientData.address?.state || "-",
          pincode: patientData.address?.pincode || "-",
        },

        emergencyContact: {
          name: patientData.emergencyContact?.name || "-",
          relation: patientData.emergencyContact?.relation || "-",
          phone: patientData.emergencyContact?.phone || "-",
        },

        allergies: patientData.allergies || [],
        existingConditions: patientData.existingConditions || [],
        currentMedications: patientData.currentMedications || [],

        opdDetails: patientData.opdDetails || {},
        ipdDetails: patientData.ipdDetails || {},

        assignedDoctorName: doctorData.name || "-"
      },

      // ------------------------------
      // DOCTOR (FULL DETAILS)
      // ------------------------------
      doctor: {
        id: doctorData._id?.toString() || "-",
        name: doctorData.name || "Unknown Doctor",
        specialization: doctorData.specialization || "-",
        phone: doctorData.phone || "-",
        email: doctorData.email || "-",

        gender: doctorData.gender || "-",
        age: doctorData.age || "-",
        experience: doctorData.experience || 0,
        qualification: doctorData.qualification || "-",
        registrationNumber: doctorData.registrationNumber || "-",

        clinicAddress: doctorData.clinicAddress || "-",
        consultationFee: doctorData.consultationFee || 0,

        // Availability
        availability: {
          days: doctorData.availability?.days || [],
          from: doctorData.availability?.from || "-",
          to: doctorData.availability?.to || "-"
        },

        profileImage: doctorData.profileImage || "-",
        bio: doctorData.bio || "-",

        isActive: doctorData.isActive ?? true,

        rating: {
          average: doctorData.rating?.average || 0,
          count: doctorData.rating?.count || 0
        }
      },

      // ------------------------------
      // BILL ITEMS
      // ------------------------------
      treatment: bill.treatment,
      amount: bill.amount,
      billItems: bill.billItems || [],

      // ------------------------------
      // PRESCRIPTION
      // ------------------------------
      prescription: bill.prescription || null,

      // ------------------------------
      // FULL DOCTOR REPORT DATA
      // ------------------------------
      report: bill.report
        ? {
          id: bill.report._id?.toString() || "-",
          reportTitle: bill.report.reportTitle || "-",
          reportDetails: bill.report.reportDetails || "-",
          date: bill.report.date || null,

          // Patient Condition
          symptoms: bill.report.symptoms || [],
          physicalExamination: bill.report.physicalExamination || "-",
          clinicalFindings: bill.report.clinicalFindings || "-",
          diagnosis: bill.report.diagnosis || "-",

          // Vitals
          vitals: {
            temperature: bill.report.vitals?.temperature || "-",
            bloodPressure: bill.report.vitals?.bloodPressure || "-",
            pulseRate: bill.report.vitals?.pulseRate || "-",
            respiratoryRate: bill.report.vitals?.respiratoryRate || "-",
            oxygenLevel: bill.report.vitals?.oxygenLevel || "-",
            weight: bill.report.vitals?.weight || "-"
          },

          // Tests & Advice
          advisedInvestigations: bill.report.advisedInvestigations || [],
          treatmentAdvice: bill.report.treatmentAdvice || "-",
          lifestyleAdvice: bill.report.lifestyleAdvice || "-",

          followUpDate: bill.report.followUpDate || null,
          additionalNotes: bill.report.additionalNotes || "-",

          // Signature
          doctorSignature: bill.report.doctorSignature || null,
        }
        : null,

      // ------------------------------
      // SCAN REPORT (FULL DATA)
      // ------------------------------
      scanReport: (bill.scanReports && bill.scanReports.length > 0)
        ? {
          id: bill.scanReports[0]._id?.toString() || "-",

          // Basic details
          type: bill.scanReports[0].type || "-",
          scanName: bill.scanReports[0].scanName || "-",
          description: bill.scanReports[0].description || "-",
          indication: bill.scanReports[0].indication || "-",

          // Results
          findings: bill.scanReports[0].findings || "-",
          impression: bill.scanReports[0].impression || "-",
          resultStatus: bill.scanReports[0].resultStatus || "Pending",

          // Lab details
          labName: bill.scanReports[0].labName || "-",
          technicianName: bill.scanReports[0].technicianName || "-",

          // Dates
          scanDate: bill.scanReports[0].scanDate || null,
          reportGeneratedDate: bill.scanReports[0].reportGeneratedDate || null,

          // Files
          pdfFile: bill.scanReports[0].pdfFile || null,
          images: bill.scanReports[0].images || [],

          // Verification
          isVerified: bill.scanReports[0].isVerified || false,
          verifiedBy: bill.scanReports[0].verifiedBy?.toString() || null
        }
        : null,

      // ------------------------------
      // LAB REPORT (First one if multiple)
      // ------------------------------
      labReport: (bill.labReports && bill.labReports.length > 0)
        ? {
          id: bill.labReports[0]._id?.toString() || "-",
          testName: bill.labReports[0].testName || "-",
          testType: bill.labReports[0].testType || "-",
          testDate: bill.labReports[0].testDate || null,
          resultStatus: bill.labReports[0].resultStatus || "-",
          cost: bill.labReports[0].cost || 0
        }
        : null
    };

    // ------------------------------
    // GENERATE PDF
    // ------------------------------
    const fileName = `bill_${bill._id}_${Date.now()}.pdf`;
    const { buffer, path: pdfFullPath } = await generatePDF(pdfData, fileName);

    bill.pdfFile = pdfFullPath;
    await bill.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(buffer);

  } catch (error) {
    console.error("❌ PDF Generation Error:", error?.message || error);
    // Send 500 but also log specific cause
    res.status(500).json({ message: "Failed to generate PDF", error: error?.message });
  }
};


// -------------------------------------------------
// 4️⃣ SEND BILL PDF TO WHATSAPP
// -------------------------------------------------
export const sendBillToPatient = async (req, res) => {
  try {
    const { patientId, billId } = req.body;

    if (!patientId && !billId) {
      return res.status(400).json({ message: "billId or patientId is required" });
    }

    let bill;
    if (billId) {
      bill = await Bill.findById(billId)
        .populate("patient")
        .populate("doctor")
        .populate("prescription")
        .populate("report")
        .populate("scanReports")
        .populate("labReports");
    } else {
      // Find latest bill for this patient
      const patientObjectId = new mongoose.Types.ObjectId(patientId);
      bill = await Bill.findOne({ patient: patientObjectId })
        .sort({ createdAt: -1 })
        .populate("patient")
        .populate("doctor")
        .populate("prescription")
        .populate("report")
        .populate("scanReports")
        .populate("labReports");
    }

    // If no bill found
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Patient must have phone number
    if (!bill.patient?.phone) {
      return res.status(400).json({ message: "Patient phone number missing" });
    }

    // ---------- REGENERATE PDF IF MISSING ----------
    if (!bill.pdfFile || !fs.existsSync(bill.pdfFile)) {
      const pdfData = {
        billId: bill._id.toString(),
        date: new Date().toLocaleDateString("en-IN"),

        patient: {
          id: bill.patient._id.toString(),
          name: bill.patient.name,
          age: bill.patient.age,
          gender: bill.patient.gender,
          phone: bill.patient.phone,
        },

        doctor: {
          name: bill.doctor?.name || "N/A",
          specialization: bill.doctor?.specialization || "N/A",
        },

        treatment: bill.treatment,
        amount: bill.amount,
        billItems: bill.billItems || [],
        prescription: bill.prescription || null,
        report: bill.report || null,
        scanReports: bill.doctorReports || [], // Note: check if this should be bill.scanReports

        // Lab Report Logic for WhatsApp PDF
        labReport: (bill.labReports && bill.labReports.length > 0)
          ? {
            id: bill.labReports[0]._id?.toString() || "-",
            testName: bill.labReports[0].testName || "-",
            testType: bill.labReports[0].testType || "-",
            testDate: bill.labReports[0].testDate || null,
            resultStatus: bill.labReports[0].resultStatus || "-",
            cost: bill.labReports[0].cost || 0
          }
          : null
      };

      const fileName = `bill_${bill._id}_${Date.now()}.pdf`;
      const result = await generatePDF(pdfData, fileName);

      bill.pdfFile = result.path;
      await bill.save();
    }

    // -----------------------------
    // WHATSAPP API SEND LOGIC
    // -----------------------------
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

    if (!token || !phoneNumberId) {
      return res.status(500).json({ message: "WhatsApp API credentials missing" });
    }

    // Clean phone number to 10 digits
    const phone = `91${bill.patient.phone.replace(/\D/g, "").slice(-10)}`;

    // Upload PDF to WhatsApp servers
    const formData = new FormData();
    formData.append("file", fs.createReadStream(bill.pdfFile));
    formData.append("type", "application/pdf");

    const uploadRes = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/media`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders(),
        },
      }
    );

    const mediaId = uploadRes.data.id;

    // Send PDF Message
    const sendRes = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "document",
        document: {
          id: mediaId,
          caption: `Dear ${bill.patient.gender === 'Male' ? 'Mr.' : 'Ms.'} ${bill.patient.name},

Greetings from NS multispeciality hospital

We would like to inform you that the bill for your recent medical consultation with Dr. ${bill.doctor?.name || 'Duty Doctor'} has been successfully generated. The bill includes the charges related to the consultation and has been prepared as per hospital records.

For your convenience, you may kindly view and download the detailed bill in PDF format using the link provided below:

View Bill (PDF):
http://localhost:5000/api/biller/view-pdf/${bill._id}

We request you to review the document and retain a copy for your records. Should you require any clarification regarding the bill or need further assistance, please do not hesitate to contact our support team.

Contact Number: 9942129724

Thank you for choosing our healthcare services. We wish you good health and look forward to serving you again.

Warm regards,
Billing Department
NS multispeciality hospital`,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Bill sent to WhatsApp successfully ✔",
      response: sendRes.data,
    });

  } catch (error) {
    console.error("❌ WhatsApp PDF Error:", error?.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.error?.message || "WhatsApp API Error",
      details: error?.response?.data
    });
  }
};

// -------------------------------------------------
// 5️⃣ GET ALL BILLS
// -------------------------------------------------
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("patient", "name age gender phone patientType mrn address")
      .populate("doctor", "name specialization")
      .populate("prescription")
      .populate("report")
      .populate("scanReports")
      .populate("labReports")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// -------------------------------------------------
// 7️⃣ UPDATE BILL
// -------------------------------------------------
export const updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const updateData = req.body;

    // Recalculate total if billItems updated
    if (updateData.billItems) {
      updateData.amount = updateData.billItems.reduce(
        (sum, item) => sum + item.charge * item.qty,
        0
      );
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      billId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      bill: updatedBill
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// -------------------------------------------------
// 8️⃣ DELETE BILL
// -------------------------------------------------
export const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findByIdAndDelete(billId);

    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Delete stored PDF if exists
    if (bill.pdfFile && fs.existsSync(bill.pdfFile)) {
      fs.unlinkSync(bill.pdfFile);
    }

    res.status(200).json({
      success: true,
      message: "Bill deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// -------------------------------------------------
// 1️⃣3️⃣ PUBLIC VIEW BILL PDF (GET ROUTE)
// -------------------------------------------------
export const viewBillPDF = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId)
      .populate("patient")
      .populate("doctor")
      .populate("prescription")
      .populate("report")
      .populate("scanReports");

    if (!bill) return res.status(404).send("Bill not found");

    // Ensure we handle missing patient/doctor data gracefully
    const patientData = bill.patient || {};
    const doctorData = bill.doctor || {};

    // ------------------------------
    // FULL PATIENT OBJECT FOR PDF
    // ------------------------------
    const pdfData = {
      billId: bill._id.toString(),
      date: new Date().toLocaleDateString("en-IN"),

      // FULL PATIENT DETAILS
      patient: {
        id: patientData._id?.toString() || "N/A",
        name: patientData.name || "Unknown Patient",
        age: patientData.age || "-",
        gender: patientData.gender || "-",
        phone: patientData.phone || "-",
        email: patientData.email || "-",
        patientType: patientData.patientType || "-",
        bloodGroup: patientData.bloodGroup || "-",
        mrn: patientData.mrn || "-",
        address: {
          line1: patientData.address?.line1 || "-",
          line2: patientData.address?.line2 || "-",
          city: patientData.address?.city || "-",
          state: patientData.address?.state || "-",
          pincode: patientData.address?.pincode || "-",
        },
        emergencyContact: {
          name: patientData.emergencyContact?.name || "-",
          relation: patientData.emergencyContact?.relation || "-",
          phone: patientData.emergencyContact?.phone || "-",
        },
        allergies: patientData.allergies || [],
        existingConditions: patientData.existingConditions || [],
        currentMedications: patientData.currentMedications || [],
        opdDetails: patientData.opdDetails || {},
        ipdDetails: patientData.ipdDetails || {},
        assignedDoctorName: doctorData.name || "-"
      },

      // ------------------------------
      // DOCTOR (FULL DETAILS)
      // ------------------------------
      doctor: {
        id: doctorData._id?.toString() || "-",
        name: doctorData.name || "Unknown Doctor",
        specialization: doctorData.specialization || "-",
        phone: doctorData.phone || "-",
        email: doctorData.email || "-",
        gender: doctorData.gender || "-",
        age: doctorData.age || "-",
        experience: doctorData.experience || 0,
        qualification: doctorData.qualification || "-",
        registrationNumber: doctorData.registrationNumber || "-",
        clinicAddress: doctorData.clinicAddress || "-",
        consultationFee: doctorData.consultationFee || 0,
        availability: {
          days: doctorData.availability?.days || [],
          from: doctorData.availability?.from || "-",
          to: doctorData.availability?.to || "-"
        },
        profileImage: doctorData.profileImage || "-",
        bio: doctorData.bio || "-",
        isActive: doctorData.isActive ?? true,
        rating: {
          average: doctorData.rating?.average || 0,
          count: doctorData.rating?.count || 0
        }
      },

      // ------------------------------
      // BILL ITEMS
      // ------------------------------
      treatment: bill.treatment,
      amount: bill.amount,
      billItems: bill.billItems || [],
      prescription: bill.prescription || null,

      // ------------------------------
      // FULL DOCTOR REPORT DATA
      // ------------------------------
      report: bill.report
        ? {
          id: bill.report._id?.toString() || "-",
          reportTitle: bill.report.reportTitle || "-",
          reportDetails: bill.report.reportDetails || "-",
          date: bill.report.date || null,
          symptoms: bill.report.symptoms || [],
          physicalExamination: bill.report.physicalExamination || "-",
          clinicalFindings: bill.report.clinicalFindings || "-",
          diagnosis: bill.report.diagnosis || "-",
          vitals: {
            temperature: bill.report.vitals?.temperature || "-",
            bloodPressure: bill.report.vitals?.bloodPressure || "-",
            pulseRate: bill.report.vitals?.pulseRate || "-",
            respiratoryRate: bill.report.vitals?.respiratoryRate || "-",
            oxygenLevel: bill.report.vitals?.oxygenLevel || "-",
            weight: bill.report.vitals?.weight || "-"
          },
          advisedInvestigations: bill.report.advisedInvestigations || [],
          treatmentAdvice: bill.report.treatmentAdvice || "-",
          lifestyleAdvice: bill.report.lifestyleAdvice || "-",
          followUpDate: bill.report.followUpDate || null,
          additionalNotes: bill.report.additionalNotes || "-",
          doctorSignature: bill.report.doctorSignature || null,
        }
        : null,

      // ------------------------------
      // SCAN REPORT
      // ------------------------------
      scanReport: (bill.scanReports && bill.scanReports.length > 0)
        ? {
          id: bill.scanReports[0]._id?.toString() || "-",
          type: bill.scanReports[0].type || "-",
          scanName: bill.scanReports[0].scanName || "-",
          description: bill.scanReports[0].description || "-",
          indication: bill.scanReports[0].indication || "-",
          findings: bill.scanReports[0].findings || "-",
          impression: bill.scanReports[0].impression || "-",
          resultStatus: bill.scanReports[0].resultStatus || "Pending",
          labName: bill.scanReports[0].labName || "-",
          technicianName: bill.scanReports[0].technicianName || "-",
          scanDate: bill.scanReports[0].scanDate || null,
          reportGeneratedDate: bill.scanReports[0].reportGeneratedDate || null,
          pdfFile: bill.scanReports[0].pdfFile || null,
          images: bill.scanReports[0].images || [],
          isVerified: bill.scanReports[0].isVerified || false,
          verifiedBy: bill.scanReports[0].verifiedBy?.toString() || null
        }
        : null,

      // ------------------------------
      // LAB REPORT (First one if multiple)
      // ------------------------------
      labReport: (bill.labReports && bill.labReports.length > 0)
        ? {
          id: bill.labReports[0]._id?.toString() || "-",
          testName: bill.labReports[0].testName || "-",
          testType: bill.labReports[0].testType || "-",
          testDate: bill.labReports[0].testDate || null,
          resultStatus: bill.labReports[0].resultStatus || "-",
          cost: bill.labReports[0].cost || 0
        }
        : null
    };

    // ------------------------------
    // GENERATE PDF
    // ------------------------------
    const fileName = `bill_${bill._id}_${Date.now()}.pdf`;
    const { buffer, path: pdfFullPath } = await generatePDF(pdfData, fileName);

    // Save path for future use
    bill.pdfFile = pdfFullPath;
    await bill.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(buffer);

  } catch (error) {
    console.error("❌ PDF View Error:", error?.message || error);
    res.status(500).send("Failed to load PDF");
  }
};

/* =====================================================
   BILLER PROFILE
===================================================== */
export const getBillerProfile = async (req, res) => {
  try {
    const biller = await Biller.findById(req.user.id).select("-password");
    if (!biller) return res.status(404).json({ message: "Biller not found" });
    res.status(200).json(biller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBillerProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.email;
    delete updateData.role;
    delete updateData.password;
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const biller = await Biller.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
    res.status(200).json(biller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
   UNIVERSAL CLINICAL RECORD PDF DOWNLOAD
===================================================== */
export const downloadClinicalRecordPdf = async (req, res) => {
  try {
    const { type, id } = req.params;
    let data = {};

    if (type === 'bill') {
      const bill = await Bill.findById(id).populate("patient doctor prescription report scanReports labReports");
      if (!bill) throw new Error("Bill not found");
      data = {
        billId: bill._id,
        date: bill.createdAt,
        patient: bill.patient,
        doctor: bill.doctor,
        billItems: bill.billItems,
        amount: bill.amount,
        paymentMode: bill.paymentMode,
        paid: bill.paid,
        prescription: bill.prescription,
        report: bill.report,
        scanReport: bill.scanReports?.[0],
        labReport: bill.labReports?.[0]
      };
    } else if (type === 'prescription') {
      const pres = await Prescription.findById(id).populate('patient doctor').lean();
      if (!pres) throw new Error("Prescription not found");
      data = { prescription: pres, patient: pres.patient, doctor: pres.doctor, date: pres.createdAt };
    } else if (type === 'report') {
      const report = await Report.findById(id).populate('patient doctor').lean();
      if (!report) throw new Error("Report not found");
      data = { report, patient: report.patient, doctor: report.doctor, date: report.date };
    } else if (type === 'scan-report') {
      const scan = await ScanReport.findById(id).populate('patient doctor').lean();
      if (!scan) throw new Error("Scan Report not found");
      data = { scanReport: scan, patient: scan.patient, doctor: scan.doctor, date: scan.createdAt };
    } else if (type === 'lab-report') {
      const lab = await LabReport.findById(id).populate('patient doctor').lean();
      if (!lab) throw new Error("Lab Report not found");
      data = { labReport: lab, patient: lab.patient, doctor: lab.doctor, date: lab.testDate };
    }

    const fileName = `${type}_${id}.pdf`;
    const { buffer } = await generatePDF(data, fileName);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${fileName}`,
      "Content-Length": buffer.length,
    });

    res.send(buffer);

  } catch (error) {
    console.error("Clinical PDF Error:", error);
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};
