import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import LabNavbar from "../../components/LabNavbar";
import { LAB_TEST_MASTER } from "../../constants/labTestMaster";
import "../../styles/lab/CreateLabReport.css";

export default function CreateLabReport() {
    const navigate = useNavigate();
    const location = useLocation();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        id: "",
        patient: "",
        doctor: "",
        patientName: "",
        testType: "Hematology",
        testName: "",
        description: "",
        resultDetails: "",
        labName: "",
        technicianName: "",
        resultStatus: "Normal",
        pdfFile: "",
        reportGeneratedDate: new Date().toISOString().split("T")[0],
        testDate: new Date().toISOString().split("T")[0],
        cost: 0,
        isVerified: false,
        verifiedBy: ""
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const [doctorsRes, profileRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/lab/all-doctors", { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get("http://localhost:5000/api/lab/profile", { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (doctorsRes.data.success) {
                    setDoctors(doctorsRes.data.doctors);
                }

                if (profileRes.data && !formData.id) {
                    setFormData(prev => ({
                        ...prev,
                        technicianName: profileRes.data.name,
                        labName: profileRes.data.department || "CENTRAL_PATHOLOGY_LAB"
                    }));
                }
            } catch (err) {
                console.error("Fetch failure", err);
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
                testType: r.testType || "Hematology",
                testName: r.testName || "",
                description: r.description || "",
                resultDetails: r.resultDetails || "",
                labName: r.labName || "",
                technicianName: r.technicianName || "",
                resultStatus: r.resultStatus || "Pending",
                pdfFile: r.pdfFile || "",
                reportGeneratedDate: r.reportGeneratedDate ? r.reportGeneratedDate.split("T")[0] : new Date().toISOString().split("T")[0],
                cost: r.cost || 0,
                testDate: r.testDate ? r.testDate.split("T")[0] : new Date().toISOString().split("T")[0],
                isVerified: r.isVerified || false,
                verifiedBy: r.verifiedBy?._id || r.verifiedBy || ""
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
        if (name === "testType") {
            setFormData({
                ...formData,
                testType: value,
                testName: LAB_TEST_MASTER[value]?.[0] || ""
            });
        } else if (name === "verifiedBy") {
            if (value) {
                setFormData({ ...formData, verifiedBy: value, isVerified: true });
            } else {
                setFormData({ ...formData, verifiedBy: "", isVerified: false });
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
                await axios.put(`http://localhost:5000/api/lab/report/${formData.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post("http://localhost:5000/api/lab/report", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            navigate("/lab/reports");
        } catch (err) {
            console.error("Save failure", err);
        }
    };

    return (
        <>
            <LabNavbar />
            <div className="precision-quartz-workstation entry-mode">
                <div className="diagnostic-grid-overlay"></div>

                <div className="quartz-console-layout">
                    {/* Top Control Bar */}
                    <div className="quartz-top-actions">
                        <div className="console-id-bit">
                            <span className="bit-label">PATHOLOGY_CONSOLE</span>
                            <span className="bit-val">{formData.id ? "REVISION_MODE" : "NEW_SAMPLE_ANALYSIS"}</span>
                        </div>
                        <div className="action-cluster">
                            <button className="btn-quartz-action" onClick={handleSubmit}>
                                {formData.id ? "PUSH_UPDATE" : "COMMIT_ANALYSIS"}
                            </button>
                            <button className="btn-quartz-action" onClick={() => navigate(-1)}>
                                ABORT_SESSION
                            </button>
                        </div>
                    </div>

                    <form className="quartz-main-scrollable" onSubmit={handleSubmit}>
                        {/* Biometric Header */}
                        <div className="biometric-header-quartz entry-header">
                            <div className="subject-portrait entry-portrait">
                                <div className="portrait-mono-placeholder">
                                    {formData.patientName ? formData.patientName.charAt(0) : "S"}
                                </div>
                                <div className="portrait-scanner active"></div>
                            </div>
                            <div className="subject-meta-stack">
                                <div className="subject-title">
                                    <span className="clinical-label">TARGET_SUBJECT</span>
                                    <h2>{formData.patientName?.toUpperCase() || "MANUAL_ENTRY_REQUIRED"}</h2>
                                </div>
                                <div className="subject-stats-grid entry-selectors">
                                    <div className="stat-node entry">
                                        <span className="stat-label">REFERRING_PHYSICIAN</span>
                                        <div className="quartz-field-static">
                                            DR. {doctors.find(d => d._id === formData.doctor)?.name?.toUpperCase() || "UNASSIGNED"}
                                        </div>
                                    </div>
                                    <div className="stat-node entry">
                                        <span className="stat-label">DISCIPLINE_TYPE</span>
                                        <select name="testType" value={formData.testType} onChange={handleChange} className="quartz-select" disabled={!!formData.id}>
                                            {Object.keys(LAB_TEST_MASTER).map(key => (
                                                <option key={key} value={key}>{key.toUpperCase().replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="stat-node entry">
                                        <span className="stat-label">TEST_IDENTIFIER</span>
                                        <select name="testName" value={formData.testName} onChange={handleChange} required className="quartz-select" disabled={!!formData.id}>
                                            <option value="">SELECT_TEST</option>
                                            {LAB_TEST_MASTER[formData.testType]?.map(test => (
                                                <option key={test} value={test}>{test.toUpperCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="stat-node entry">
                                        <span className="stat-label">RESULT_STATUS</span>
                                        <select name="resultStatus" value={formData.resultStatus} onChange={handleChange} className="quartz-select">
                                            <option>NORMAL</option>
                                            <option>ABNORMAL</option>
                                            <option>CRITICAL</option>
                                            <option>PENDING</option>
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
                                        <span className="belt-text">CLINICAL_NOTES_ENTRY</span>
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
                                        <span className="belt-text">PATHOLOGY_FINDINGS_STREAM</span>
                                    </div>
                                    <textarea
                                        name="resultDetails"
                                        value={formData.resultDetails}
                                        onChange={handleChange}
                                        className="quartz-textarea high"
                                        placeholder="CAPTURE_DETAILED_FINDINGS_STREAM..."
                                    ></textarea>
                                </div>

                                <div className="matrix-section entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">LABORATORY_ID</span>
                                    </div>
                                    <div className="meta-info-list entry">
                                        <div className="meta-item">
                                            <span className="m-label">FACILITY</span>
                                            <input type="text" name="labName" value={formData.labName} readOnly className="quartz-field-input read-only" />
                                        </div>
                                        <div className="meta-item">
                                            <span className="m-label">TECH_OP</span>
                                            <input type="text" name="technicianName" value={formData.technicianName} readOnly className="quartz-field-input read-only" />
                                        </div>
                                    </div>
                                </div>

                                <div className="matrix-section entry">
                                    <div className="section-title-belt">
                                        <span className="belt-text">ACQUISITION_TELEMETRY</span>
                                    </div>
                                    <div className="meta-info-list entry">
                                        <div className="meta-item">
                                            <span className="m-label">UNIT_COST</span>
                                            <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="quartz-field-input mono" placeholder="0.00" />
                                        </div>
                                        <div className="meta-item">
                                            <span className="m-label">SAMPLE_DATE</span>
                                            <input type="date" name="testDate" value={formData.testDate} onChange={handleChange} className="quartz-field-input" />
                                        </div>
                                    </div>
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
                                <label htmlFor="isVerifiedEntry">AUTHORIZE_DATA_VERIFICATION</label>
                            </div>
                            {formData.isVerified && (
                                <div className="verification-select stat-node entry" style={{ border: 'none', padding: 0 }}>
                                    <span className="stat-label">SIGNATORY_PHYSICIAN</span>
                                    <select name="verifiedBy" value={formData.verifiedBy} onChange={handleChange} required className="quartz-select">
                                        <option value="">SELECT_SIGNATORY</option>
                                        {doctors.map(d => (
                                            <option key={d._id} value={d._id}>DR. {d.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="telemetry-node">
                                SYSTEM_REVISION: <span className="mono">v1.2.0_TECHNICAL</span>
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
                    background: #6366f1;
                    box-shadow: 0 0 15px #6366f1;
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

                .subject-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-top: 1.5rem;
                }

                .stat-node { display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; padding-left: 1rem; }
                .stat-label { font-size: 0.6rem; color: #94a3b8; font-weight: 700; margin-bottom: 0.4rem; }
                
                .quartz-select, .quartz-field-static {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem;
                    font-family: inherit;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #1e293b;
                    outline: none;
                }

                .quartz-field-static { border: none; background: none; padding: 0.4rem 0; font-size: 0.8rem; }
                .quartz-select:focus:not(:disabled) { border-color: #6366f1; background: white; }
                .quartz-select:disabled { cursor: not-allowed; opacity: 0.7; }

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

                .quartz-textarea.high { min-height: 250px; }
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

                .quartz-field-input.read-only { background: #f1f5f9; border-color: #cbd5e1; color: #64748b; cursor: not-allowed; }

                .quartz-footer-telemetry {
                    padding: 2rem 3rem;
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 700;
                    align-items: center;
                    gap: 2rem;
                }

                .verification-toggle { display: flex; align-items: center; gap: 0.75rem; color: #0f172a; flex-shrink: 0; }
                .verification-toggle input { width: 1.1rem; height: 1.1rem; cursor: pointer; }
                .mono { font-family: 'JetBrains Mono', monospace; }

                @media (max-width: 1024px) {
                    .quartz-console-layout { border: none; }
                    .biometric-header-quartz { flex-direction: column; text-align: center; }
                    .subject-stats-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .matrix-body-grid { grid-template-columns: 1fr; }
                    .matrix-section.full { grid-column: span 1; }
                    .quartz-main-scrollable { padding: 1.5rem; }
                    .quartz-footer-telemetry { flex-direction: column; gap: 1rem; text-align: center; }
                }
            `}</style>
        </>
    );
}
