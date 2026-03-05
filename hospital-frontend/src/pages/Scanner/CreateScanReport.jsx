import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ScannerNavbar from "../../components/ScannerNavbar";
import "../../styles/Scanner/CreateScanReport.css";

export default function CreateScanReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        id: "",
        patient: "",
        doctor: "",
        patientName: "",
        type: "X-Ray",
        scanName: "",
        description: "",
        indication: "",
        findings: "",
        impression: "",
        labName: "",
        technicianName: "",
        resultStatus: "Normal",
        pdfFile: "",
        reportGeneratedDate: new Date().toISOString().split("T")[0],
        scanDate: new Date().toISOString().split("T")[0],
        cost: 0,
        isVerified: false,
        verifiedBy: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/scanner/all-doctors", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setDoctors(res.data.doctors);
                }
            } catch (err) {
                console.error("Failed to fetch doctors");
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (location.state?.report) {
            const r = location.state.report;
            setFormData(prev => ({
                ...prev,
                id: r._id,
                patient: r.patient?._id || r.patient || "",
                patientName: r.patient?.name || "",
                doctor: r.doctor?._id || r.doctor || "",
                type: r.type || "X-Ray",
                scanName: r.scanName || "",
                description: r.description || "",
                indication: r.indication || "",
                findings: r.findings || "",
                impression: r.impression || "",
                labName: r.labName || "",
                technicianName: r.technicianName || "",
                resultStatus: r.resultStatus || "Normal",
                pdfFile: r.pdfFile || "",
                reportGeneratedDate: r.reportGeneratedDate ? r.reportGeneratedDate.split("T")[0] : new Date().toISOString().split("T")[0],
                cost: r.cost || 0,
                scanDate: r.scanDate ? r.scanDate.split("T")[0] : new Date().toISOString().split("T")[0],
                isVerified: r.isVerified || !!(r.doctor?._id || r.doctor),
                verifiedBy: r.verifiedBy?._id || r.verifiedBy || (r.isVerified ? (r.doctor?._id || r.doctor) : "")
            }));
        } else if (location.state?.patient) {
            const p = location.state.patient;
            setFormData(prev => ({
                ...prev,
                patient: p._id,
                patientName: p.name
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "doctor") {
            if (value) {
                setFormData({
                    ...formData,
                    doctor: value,
                    isVerified: true,
                    verifiedBy: value
                });
            } else {
                setFormData({
                    ...formData,
                    doctor: "",
                    isVerified: false,
                    verifiedBy: ""
                });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const payload = { ...formData };
            if (!payload.doctor) payload.doctor = null;
            if (!payload.verifiedBy) payload.verifiedBy = null;
            if (!payload.patient) payload.patient = null;

            if (formData.id) {
                await axios.put(`http://localhost:5000/api/scanner/scan-report/${formData.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post("http://localhost:5000/api/scanner/scan-report", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            navigate("/scanner/reports");
        } catch (err) {
            console.error("Save failure", err);
        }
    };

    return (
        <>
            <ScannerNavbar />
            <div className="precision-quartz-workstation entry-mode">
                <div className="diagnostic-grid-overlay"></div>

                <div className="quartz-console-layout">
                    {/* Top Control Bar */}
                    <div className="quartz-top-actions">
                        <div className="console-id-bit">
                            <span className="bit-label">ENTRY_CONSOLE</span>
                            <span className="bit-val">{formData.id ? "REVISION_MODE" : "NEW_ACQUISITION"}</span>
                        </div>
                        <div className="action-cluster">
                            <button className="btn-quartz-action" onClick={handleSubmit}>
                                {formData.id ? "PUSH_UPDATE" : "COMMIT_REPORT"}
                            </button>
                            <button className="btn-quartz-action" onClick={() => navigate(-1)}>
                                ABORT_SESSION
                            </button>
                        </div>
                    </div>

                    <form className="quartz-main-scrollable" onSubmit={handleSubmit}>
                        {/* Subject Selector / Status */}
                        <div className="biometric-header-quartz entry-header">
                            <div className="subject-portrait entry-portrait">
                                <div className="portrait-mono-placeholder">
                                    {formData.patientName ? formData.patientName.charAt(0) : "?"}
                                </div>
                                <div className="portrait-scanner active"></div>
                            </div>
                            <div className="subject-meta-stack">
                                <div className="subject-title">
                                    <span className="clinical-label">TARGET_SUBJECT</span>
                                    {formData.patientName ? (
                                        <h2>{formData.patientName.toUpperCase()}</h2>
                                    ) : (
                                        <input
                                            type="text"
                                            name="patient"
                                            value={formData.patient}
                                            onChange={handleChange}
                                            placeholder="ENTER_PATIENT_IDENTIFIER"
                                            className="quartz-input-large"
                                            required
                                        />
                                    )}
                                </div>
                                <div className="subject-stats-grid entry-selectors">
                                    <div className="stat-node entry">
                                        <span className="stat-label">ASSIGN_PHYSICIAN</span>
                                        <select name="doctor" value={formData.doctor} onChange={handleChange} required className="quartz-select">
                                            <option value="">SELECT_DOCTOR</option>
                                            {doctors.map(doc => (
                                                <option key={doc._id} value={doc._id}>
                                                    DR. {doc.name.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="stat-node entry">
                                        <span className="stat-label">MODALITY_TYPE</span>
                                        <select name="type" value={formData.type} onChange={handleChange} className="quartz-select">
                                            <option>X-RAY</option>
                                            <option>CT SCAN</option>
                                            <option>MRI</option>
                                            <option>ULTRASOUND</option>
                                        </select>
                                    </div>
                                    <div className="stat-node entry">
                                        <span className="stat-label">SCAN_NAME</span>
                                        <input
                                            type="text"
                                            name="scanName"
                                            value={formData.scanName}
                                            onChange={handleChange}
                                            placeholder="SCAN_DEFINITION"
                                            className="quartz-input-mini"
                                            required
                                        />
                                    </div>
                                    <div className="stat-node entry">
                                        <span className="stat-label">RESULT_STATUS</span>
                                        <select name="resultStatus" value={formData.resultStatus} onChange={handleChange} className="quartz-select">
                                            <option>NORMAL</option>
                                            <option>ABNORMAL</option>
                                            <option>CRITICAL</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Entry Matrix */}
                        <div className="diagnostic-matrix-container entry-matrix">
                            <div className="matrix-body-grid">
                                <div className="matrix-section full entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">CLINICAL_DESCRIPTION_ENTRY</span>
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="quartz-textarea"
                                        placeholder="INPUT_CLINICAL_CONTEXT_HERE..."
                                    ></textarea>
                                </div>

                                <div className="matrix-section full highlight entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">FINDINGS_STREAM_PRIMARY</span>
                                    </div>
                                    <textarea
                                        name="findings"
                                        value={formData.findings}
                                        onChange={handleChange}
                                        className="quartz-textarea high"
                                        placeholder="CAPTURE_DETAILED_FINDINGS_STREAM..."
                                    ></textarea>
                                </div>

                                <div className="matrix-section entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">INDICATION_MATRIX</span>
                                    </div>
                                    <textarea
                                        name="indication"
                                        value={formData.indication}
                                        onChange={handleChange}
                                        className="quartz-textarea low"
                                        placeholder="SYSTEM_INDICATIONS..."
                                    ></textarea>
                                </div>

                                <div className="matrix-section entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">IMPRESSION_LAYER</span>
                                    </div>
                                    <textarea
                                        name="impression"
                                        value={formData.impression}
                                        onChange={handleChange}
                                        className="quartz-textarea low"
                                        placeholder="FINAL_STUDY_IMPRESSION..."
                                    ></textarea>
                                </div>

                                <div className="matrix-section entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">EQUIPMENT_SPEC_INPUT</span>
                                    </div>
                                    <div className="meta-info-list entry">
                                        <div className="meta-item">
                                            <span className="m-label">FACILITY_ID</span>
                                            <input type="text" name="labName" value={formData.labName} onChange={handleChange} className="quartz-field-input" placeholder="LAB_NAME" />
                                        </div>
                                        <div className="meta-item">
                                            <span className="m-label">OP_IDENT</span>
                                            <input type="text" name="technicianName" value={formData.technicianName} onChange={handleChange} className="quartz-field-input" placeholder="TECH_NAME" />
                                        </div>
                                    </div>
                                </div>

                                <div className="matrix-section entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">TELEMETRY_DATA_SETUP</span>
                                    </div>
                                    <div className="meta-info-list entry">
                                        <div className="meta-item">
                                            <span className="m-label">ACQ_COST</span>
                                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="quartz-field-input mono" placeholder="0.00" />
                                        </div>
                                        <div className="meta-item">
                                            <span className="m-label">ACQ_DATE</span>
                                            <input type="date" name="scanDate" value={formData.scanDate} onChange={handleChange} className="quartz-field-input" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* File Upload Zone */}
                            <div className="quartz-pdf-integration entry">
                                <div className="pdf-header">
                                    <span className="p-label">ATTACH_DATA_STREAM (PDF)</span>
                                    <span className="p-count">{formData.pdfFile ? "01_LOADED" : "00_EMPTY"}</span>
                                </div>
                                <div className="pdf-action-zone">
                                    {formData.pdfFile ? (
                                        <button type="button" className="btn-quartz-pdf danger" onClick={() => setFormData({ ...formData, pdfFile: "" })}>
                                            PURGE_LOADED_FILE
                                        </button>
                                    ) : (
                                        <div className="quartz-file-upload">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                id="pdf-upload"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setFormData({ ...formData, pdfFile: reader.result });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                            <label htmlFor="pdf-upload" className="btn-quartz-pdf">INJECT_PDF_RECORDS</label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Verification */}
                        <div className="quartz-footer-telemetry entry-footer">
                            <div className="verification-toggle">
                                <input
                                    type="checkbox"
                                    id="isVerifiedEntry"
                                    checked={formData.isVerified}
                                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                />
                                <label htmlFor="isVerifiedEntry">AUTHORIZE_DATA_VERIFICATION {!!formData.doctor && "[AUTO_ENABLED]"}</label>
                            </div>
                            <div className="telemetry-node">
                                REVISION: <span className="mono">v1.2.0_TECHNICAL</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

                .precision-quartz-workstation {
                    background: #ffffff;
                    min-height: 100vh;
                    position: relative;
                    font-family: 'JetBrains Mono', monospace;
                    color: #0f172a;
                    overflow: hidden;
                }

                .diagnostic-grid-overlay {
                    position: fixed;
                    inset: 0;
                    background-image: 
                        linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                        linear-gradient(to bottom, #f1f5f9 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                    z-index: 0;
                }

                .quartz-console-layout {
                    position: relative;
                    z-index: 1;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    max-width: 1400px;
                    margin: 0 auto;
                    border-left: 2px solid #e2e8f0;
                    border-right: 2px solid #e2e8f0;
                    background: rgba(255, 255, 255, 0.95);
                }

                .quartz-top-actions {
                    padding: 1.5rem 3rem;
                    background: #0f172a;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .console-id-bit { display: flex; flex-direction: column; }
                .bit-label { font-size: 0.6rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.1em; }
                .bit-val { font-size: 0.9rem; font-weight: 800; }

                .action-cluster { display: flex; gap: 1rem; }

                .btn-quartz-action {
                    background: #1e293b;
                    color: white;
                    border: 1px solid #334155;
                    padding: 0.5rem 1rem;
                    font-size: 0.7rem;
                    font-weight: 700;
                    font-family: inherit;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .btn-quartz-action:hover { background: #334155; border-color: #6366f1; }

                .quartz-main-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding: 3rem;
                    display: block;
                }

                /* Biometric Header */
                .biometric-header-quartz {
                    display: flex;
                    gap: 3rem;
                    margin-bottom: 3rem;
                    align-items: center;
                }

                .subject-portrait {
                    width: 160px;
                    height: 160px;
                    background: #f8fafc;
                    border: 2px solid #0f172a;
                    position: relative;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .portrait-mono-placeholder {
                    width: 100%;
                    height: 100%;
                    display: grid;
                    place-items: center;
                    font-size: 4rem;
                    font-weight: 800;
                    color: #cbd5e1;
                }

                .portrait-scanner.active {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #22c55e;
                    box-shadow: 0 0 15px #22c55e;
                    animation: scanLine 3s ease-in-out infinite;
                }

                @keyframes scanLine {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }

                .subject-meta-stack { flex: 1; }
                .subject-title h2 { margin: 0; font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; color: #0f172a; }
                .clinical-label { font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; letter-spacing: 0.1em; }

                .quartz-input-large {
                    width: 100%;
                    background: none;
                    border: none;
                    border-bottom: 2px dashed #e2e8f0;
                    padding: 0.5rem 0;
                    font-size: 2rem;
                    font-weight: 900;
                    color: #0f172a;
                    font-family: inherit;
                    outline: none;
                }

                .subject-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }

                .stat-node { display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; padding-left: 1rem; }
                .stat-label { font-size: 0.6rem; color: #94a3b8; font-weight: 700; margin-bottom: 0.4rem; }
                
                .quartz-select, .quartz-input-mini {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem;
                    font-family: inherit;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    outline: none;
                }

                .quartz-select:focus, .quartz-input-mini:focus { border-color: #6366f1; background: white; }

                /* Diagnostic Matrix */
                .diagnostic-matrix-container { border: 1px solid #0f172a; }

                .matrix-body-grid { display: grid; grid-template-columns: 1fr 1fr; }
                .matrix-section { border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 0; }
                .matrix-section.full { grid-column: span 2; }
                .matrix-section.highlight { background: #fdfdfd; }

                .section-title-belt {
                    background: #f1f5f9;
                    padding: 0.4rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .belt-text { font-size: 0.6rem; font-weight: 800; color: #475569; letter-spacing: 0.05em; }

                .quartz-textarea {
                    width: 100%;
                    padding: 1.5rem;
                    border: none;
                    background: none;
                    font-family: inherit;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    color: #334155;
                    resize: vertical;
                    min-height: 100px;
                    outline: none;
                }

                .quartz-textarea.high { min-height: 200px; }
                .quartz-textarea.low { min-height: 80px; }
                .quartz-textarea:focus { background: rgba(99, 102, 241, 0.02); }

                .meta-info-list { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .meta-item { display: flex; justify-content: space-between; align-items: center; }
                .m-label { font-size: 0.65rem; color: #94a3b8; font-weight: 700; }
                
                .quartz-field-input {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem 0.75rem;
                    font-family: inherit;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: #1e293b;
                    outline: none;
                    text-align: right;
                }

                .quartz-pdf-integration {
                    padding: 2rem;
                    background: #0f172a;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .p-label { font-size: 0.65rem; color: #94a3b8; font-weight: 700; display: block; }
                .p-count { font-size: 1.2rem; font-weight: 900; }

                .btn-quartz-pdf {
                    background: #6366f1;
                    color: white;
                    border: none;
                    padding: 0.75rem 2rem;
                    font-family: inherit;
                    font-size: 0.75rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: inline-block;
                }

                .btn-quartz-pdf.danger { background: #ef4444; }
                .quartz-file-upload input { display: none; }

                .quartz-footer-telemetry {
                    padding: 2rem 3rem;
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 700;
                    align-items: center;
                }

                .verification-toggle { display: flex; align-items: center; gap: 1rem; color: #0f172a; }
                .verification-toggle input { width: 1.2rem; height: 1.2rem; cursor: pointer; }
                .mono { font-family: 'JetBrains Mono', monospace; }

                /* Loading States */
                .compact-loader { padding: 10rem; text-align: center; }
                .micro-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                @media (max-width: 1024px) {
                    .quartz-console-layout { border: none; }
                    .biometric-header-quartz { flex-direction: column; text-align: center; }
                    .subject-stats-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .matrix-body-grid { grid-template-columns: 1fr; }
                    .matrix-section.full { grid-column: span 1; }
                    .quartz-main-scrollable { padding: 1.5rem; }
                }
            `}</style>
        </>
    );
}
