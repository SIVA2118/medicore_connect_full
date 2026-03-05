import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Doctor/Report.css";

export default function Report() {
    // Determine mode: "create" (patientId) or "edit" (reportId)
    const { patientId, reportId } = useParams();
    const isEditMode = Boolean(reportId);

    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    const [reportData, setReportData] = useState({
        reportTitle: "",
        reportDetails: "",
        symptoms: "",
        physicalExamination: "",
        clinicalFindings: "",
        diagnosis: "",
        temperature: "",
        bloodPressure: "",
        pulseRate: "",
        respiratoryRate: "",
        oxygenLevel: "",
        weight: "",
        advisedInvestigations: "",
        treatmentAdvice: "",
        lifestyleAdvice: "",
        followUpDate: "",
        additionalNotes: "",
        doctorSignature: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (isEditMode) {
                    // Fetch existing report
                    const res = await axios.get(`http://localhost:5000/api/doctor/report/${reportId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const r = res.data;
                    setPatient(r.patient); // Patient info comes populated in report

                    // Populate form
                    setReportData({
                        reportTitle: r.reportTitle,
                        reportDetails: r.reportDetails,
                        symptoms: r.symptoms.join(", "),
                        physicalExamination: r.physicalExamination,
                        clinicalFindings: r.clinicalFindings,
                        diagnosis: r.diagnosis,
                        temperature: r.vitals?.temperature,
                        bloodPressure: r.vitals?.bloodPressure,
                        pulseRate: r.vitals?.pulseRate,
                        respiratoryRate: r.vitals?.respiratoryRate,
                        oxygenLevel: r.vitals?.oxygenLevel,
                        weight: r.vitals?.weight,
                        advisedInvestigations: r.advisedInvestigations.join(", "),
                        treatmentAdvice: r.treatmentAdvice,
                        lifestyleAdvice: r.lifestyleAdvice,
                        followUpDate: r.followUpDate ? r.followUpDate.split('T')[0] : "",
                        additionalNotes: r.additionalNotes,
                        doctorSignature: r.doctorSignature,
                    });
                } else {
                    // Create mode: fetch patient details
                    const res = await axios.get(`http://localhost:5000/api/doctor/patient/${patientId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPatient(res.data);
                }
            } catch (err) {
                console.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId, reportId, isEditMode]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...reportData,
                // Only include patientId if creating new (although backend handles logic)
                ...(isEditMode ? {} : { patientId }),
                symptoms: reportData.symptoms.split(",").map(s => s.trim()).filter(s => s),
                advisedInvestigations: reportData.advisedInvestigations.split(",").map(i => i.trim()).filter(i => i),
                vitals: {
                    temperature: reportData.temperature,
                    bloodPressure: reportData.bloodPressure,
                    pulseRate: reportData.pulseRate,
                    respiratoryRate: reportData.respiratoryRate,
                    oxygenLevel: reportData.oxygenLevel,
                    weight: reportData.weight
                }
            };

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/doctor/report/${reportId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Report Updated Successfully!");
                navigate(`/doctor/report/view/${reportId}`);
            } else {
                await axios.post("http://localhost:5000/api/doctor/report", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Medical Report Created Successfully!");
                navigate(`/doctor/patient/${patientId}`);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to save report");
        }
    };

    if (loading) return <div className="loading-state">Loading form...</div>;

    return (
        <div className="report-container">
            <div className="report-card">
                <header className="report-header">
                    <h2>{isEditMode ? "Edit Clinical Report" : "New Clinical Report"}</h2>
                    <div className="patient-banner">
                        <p><strong>Patient:</strong> {patient?.name}</p>
                        <p><strong>Age/Gender:</strong> {patient?.age} / {patient?.gender}</p>
                        <p><strong>ID:</strong> {patient?._id?.slice(-6).toUpperCase()}</p>
                    </div>
                </header>

                <form onSubmit={handleReportSubmit}>
                    <div className="form-section">
                        <h3>1. Report Summary</h3>
                        <div className="input-group">
                            <label>Report Title</label>
                            <input
                                className="report-input title-input"
                                placeholder="e.g. Weekly Checklist, General Consultation"
                                value={reportData.reportTitle}
                                onChange={e => setReportData({ ...reportData, reportTitle: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>2. Vitals & Measurements</h3>
                        <div className="grid-vitals">
                            <div className="input-group">
                                <label>Blood Pressure</label>
                                <input className="report-input" placeholder="120/80" value={reportData.bloodPressure} onChange={e => setReportData({ ...reportData, bloodPressure: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Pulse Rate (bpm)</label>
                                <input className="report-input" placeholder="72" value={reportData.pulseRate} onChange={e => setReportData({ ...reportData, pulseRate: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Temperature (°F)</label>
                                <input className="report-input" placeholder="98.6" value={reportData.temperature} onChange={e => setReportData({ ...reportData, temperature: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Oxygen Level (%)</label>
                                <input className="report-input" placeholder="98" value={reportData.oxygenLevel} onChange={e => setReportData({ ...reportData, oxygenLevel: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Weight (kg)</label>
                                <input className="report-input" placeholder="70" value={reportData.weight} onChange={e => setReportData({ ...reportData, weight: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>3. Clinical Observations</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Symptoms (comma separated)</label>
                                <textarea className="report-textarea" placeholder="Fever, Cough, Headache..." value={reportData.symptoms} onChange={e => setReportData({ ...reportData, symptoms: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Diagnosis</label>
                                <textarea className="report-textarea" placeholder="Enter final or provisional diagnosis..." value={reportData.diagnosis} onChange={e => setReportData({ ...reportData, diagnosis: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>Clinical Findings</label>
                                <textarea className="report-textarea" placeholder="Findings from examination..." value={reportData.clinicalFindings} onChange={e => setReportData({ ...reportData, clinicalFindings: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Physical Examination</label>
                                <textarea className="report-textarea" placeholder="Detailed physical exam notes..." value={reportData.physicalExamination} onChange={e => setReportData({ ...reportData, physicalExamination: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>4. Advice & Next Steps</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Treatment Advice</label>
                                <textarea className="report-textarea" placeholder="Rest, Medication..." value={reportData.treatmentAdvice} onChange={e => setReportData({ ...reportData, treatmentAdvice: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Advised Investigations (comma separated)</label>
                                <textarea className="report-textarea" placeholder="Blood Test, X-Ray..." value={reportData.advisedInvestigations} onChange={e => setReportData({ ...reportData, advisedInvestigations: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>Follow-up Date</label>
                                <input type="date" className="report-input" value={reportData.followUpDate} onChange={e => setReportData({ ...reportData, followUpDate: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Lifestyle Advice</label>
                                <input className="report-input" placeholder="Avoid oily food..." value={reportData.lifestyleAdvice} onChange={e => setReportData({ ...reportData, lifestyleAdvice: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>5. Final Notes & Signature</h3>
                        <div className="input-group">
                            <label>Report Details (Comprehensive)</label>
                            <textarea
                                className="report-textarea"
                                style={{ minHeight: '150px' }}
                                placeholder="Complete case history and report summary..."
                                value={reportData.reportDetails}
                                onChange={e => setReportData({ ...reportData, reportDetails: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid-2" style={{ marginTop: '1.5rem' }}>
                            <div className="input-group">
                                <label>Additional Notes</label>
                                <textarea className="report-textarea" placeholder="Any other observations..." value={reportData.additionalNotes} onChange={e => setReportData({ ...reportData, additionalNotes: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Doctor Digital Signature (Name)</label>
                                <input className="report-input" placeholder="Type your full name as signature" value={reportData.doctorSignature} onChange={e => setReportData({ ...reportData, doctorSignature: e.target.value })} required />
                            </div>
                        </div>
                    </div>

                    <div className="actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Discard</button>
                        <button type="submit" className="btn-submit">{isEditMode ? "Update Report" : "Submit Final Report"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
