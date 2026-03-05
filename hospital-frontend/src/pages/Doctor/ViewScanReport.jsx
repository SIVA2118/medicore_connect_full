import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ScannerNavbar from "../../components/ScannerNavbar";
import DoctorNavbar from "../../components/DoctorNavbar";
import "../../styles/lab/ViewLabReport.css";

export default function ViewScanReport() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const token = localStorage.getItem("token");
                const baseUrl = role === 'doctor' ? 'http://localhost:5000/api/doctor' : 'http://localhost:5000/api/scanner';
                const res = await axios.get(`${baseUrl}/scan-report/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setReport(res.data.report);
                }
            } catch (err) {
                console.error("Failed to fetch report", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId, role]);

    const handleDelete = async () => {
        if (!window.confirm("CONFIRM_ACTION: DELETE_PERMANENTLY?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/scanner/scan-report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate("/scanner/reports");
        } catch (err) {
            console.error("Deletion failure", err);
        }
    };

    const handleVerify = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(`http://localhost:5000/api/scanner/scan-report/verify/${reportId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReport({ ...report, isVerified: true });
            }
        } catch (err) {
            console.error("Verification failed", err);
        }
    };

    if (loading) return (
        <div className="compact-slate-workstation">
            <div className="compact-loader">
                <div className="micro-spinner"></div>
                <p>INITIALIZING_SCAN_MATRIX...</p>
            </div>
        </div>
    );

    if (!report) return (
        <div className="compact-slate-workstation">
            <div className="compact-empty-state">
                <p>ERROR_404: SCAN_RECORD_NOT_FOUND</p>
                <button className="btn-mini-back" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>RETURN_TO_BASE</button>
            </div>
        </div>
    );

    const resultStatus = report.resultStatus?.toUpperCase() || 'PENDING';

    return (
        <>
            {role === 'doctor' ? <DoctorNavbar /> : <ScannerNavbar />}
            <div className="precision-quartz-workstation">
                <div className="diagnostic-grid-overlay"></div>

                <div className="quartz-console-layout">
                    {/* Top Control Bar */}
                    <div className="quartz-top-actions">
                        <div className="console-id-bit">
                            <span className="bit-label">CONSOLE_ID</span>
                            <span className="bit-val">{report._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="action-cluster">
                            {role === 'scanner' && !report.isVerified && (
                                <>
                                    <button className="btn-quartz-action" onClick={() => navigate("/scanner/create-report", { state: { report } })}>
                                        EDIT_ENTRY
                                    </button>
                                    <button className="btn-quartz-action" onClick={handleVerify}>
                                        VERIFY_DATA
                                    </button>
                                    <button className="btn-quartz-action danger" onClick={handleDelete}>
                                        PURGE_RECORD
                                    </button>
                                </>
                            )}
                            <button className="btn-quartz-action" onClick={() => navigate(-1)}>
                                ←_BACK
                            </button>
                        </div>
                    </div>

                    <div className="quartz-main-scrollable">
                        {/* Biometric Header */}
                        <div className="biometric-header-quartz">
                            <div className="subject-portrait">
                                {report.patient?.profileImage ? (
                                    <img src={report.patient.profileImage} alt="SUBJECT" />
                                ) : (
                                    <div className="portrait-mono-placeholder">{report.patient?.name?.charAt(0)}</div>
                                )}
                                <div className="portrait-scanner"></div>
                            </div>
                            <div className="subject-meta-stack">
                                <div className="subject-title">
                                    <span className="clinical-label">SUBJECT_NAME</span>
                                    <h2>{report.patient?.name?.toUpperCase()}</h2>
                                </div>
                                <div className="subject-stats-grid">
                                    <div className="stat-node">
                                        <span className="stat-label">AGE</span>
                                        <span className="stat-val">{report.patient?.age}Y</span>
                                    </div>
                                    <div className="stat-node">
                                        <span className="stat-label">GENDER</span>
                                        <span className="stat-val">{report.patient?.gender?.toUpperCase()}</span>
                                    </div>
                                    <div className="stat-node">
                                        <span className="stat-label">MRN_IDENT</span>
                                        <span className="stat-val">{report.patient?.mrn || 'N/A'}</span>
                                    </div>
                                    <div className="stat-node">
                                        <span className="stat-label">DEPT_TYPE</span>
                                        <span className="stat-val">{report.type}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Diagnostic Matrix */}
                        <div className="diagnostic-matrix-container">
                            <div className="matrix-info-belt">
                                <div className="belt-node">
                                    <span className="node-label">SCAN_DEFINITION</span>
                                    <span className="node-val accent">{report.scanName.toUpperCase()}</span>
                                </div>
                                <div className="belt-node">
                                    <span className="node-label">ACQUISITION_DATE</span>
                                    <span className="node-val">{new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="belt-node">
                                    <span className="node-label">REFERRING_PHYSICIAN</span>
                                    <span className="node-val">DR. {report.doctor?.name?.toUpperCase() || 'UNASSIGNED'}</span>
                                </div>
                                <div className="belt-node">
                                    <span className="node-label">RESULT_STATUS</span>
                                    <span className={`node-val status-${resultStatus.toLowerCase()}`}>{resultStatus}</span>
                                </div>
                            </div>

                            <div className="matrix-body-grid">
                                <div className="matrix-section full">
                                    <div className="section-title-belt">
                                        <span className="belt-text">CLINICAL_DESCRIPTION</span>
                                    </div>
                                    <div className="observations-content">
                                        {report.description || "NO_CLINICAL_INFO_ENTERED"}
                                    </div>
                                </div>

                                <div className="matrix-section full highlight">
                                    <div className="section-title-belt">
                                        <span className="belt-text">FINDINGS_REPORT</span>
                                    </div>
                                    <div className="findings-stream-content">
                                        {report.findings || "NO_FINDINGS_CAPTURED"}
                                    </div>
                                </div>

                                <div className="matrix-section">
                                    <div className="section-title-belt">
                                        <span className="belt-text">EQUIPMENT_SPEC</span>
                                    </div>
                                    <div className="meta-info-list">
                                        <div className="meta-item">
                                            <span className="m-label">FACILITY_ORIGIN</span>
                                            <span className="m-val">{report.labName || 'RADIOLOGY_HUB'}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="m-label">PRIMARY_OPERATOR</span>
                                            <span className="m-val">{report.technicianName || 'SYSTEM_AUTO'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="matrix-section">
                                    <div className="section-title-belt">
                                        <span className="belt-text">BILLING_TELEMETRY</span>
                                    </div>
                                    <div className="meta-info-list">
                                        <div className="meta-item">
                                            <span className="m-label">ACQUISITION_COST</span>
                                            <span className="m-val mono">₹{report.cost}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="m-label">PAYMENT_STATUS</span>
                                            <span className={`m-val ${report.isBilled ? 'billed' : 'pending'}`}>
                                                {report.isBilled ? 'BILLED_AUTHORIZED' : 'PENDING_CLEARANCE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="quartz-footer-telemetry" style={{ marginTop: '2rem' }}>
                            <div className="telemetry-node">
                                TIMESTAMP: <span className="mono">{new Date(report.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="telemetry-node">
                                AUTH_STATUS: <span className="mono">{report.isVerified ? 'VERIFIED_SIGNATURE_CAPTURED' : 'PENDING_FINAL_AUTH'}</span>
                            </div>
                        </div>
                    </div>
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

                .console-id-bit {
                    display: flex;
                    flex-direction: column;
                }

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
                .btn-quartz-action.danger:hover { background: #ef4444; border-color: #ef4444; }

                .quartz-main-scrollable {
                    flex: 1;
                    overflow-y: auto;
                    padding: 3rem;
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

                .subject-portrait img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: grayscale(100%) contrast(1.1);
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

                .portrait-scanner {
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
                .subject-title h2 { margin: 0; font-size: 2.5rem; font-weight: 900; letter-spacing: -0.05em; }
                .clinical-label { font-size: 0.7rem; color: #64748b; font-weight: 700; display: block; letter-spacing: 0.1em; }

                .subject-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 2rem;
                    margin-top: 1.5rem;
                }

                .stat-node { display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; padding-left: 1rem; }
                .stat-label { font-size: 0.6rem; color: #94a3b8; font-weight: 700; }
                .stat-val { font-size: 1rem; font-weight: 800; color: #1e293b; }

                /* Diagnostic Matrix */
                .diagnostic-matrix-container {
                    border: 1px solid #0f172a;
                }

                .matrix-info-belt {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    background: #f8fafc;
                    border-bottom: 2px solid #0f172a;
                }

                .belt-node {
                    padding: 1rem 1.5rem;
                    border-right: 1px solid #e2e8f0;
                }

                .node-label { font-size: 0.6rem; color: #64748b; font-weight: 700; display: block; margin-bottom: 0.2rem; }
                .node-val { font-size: 0.8rem; font-weight: 800; color: #0f172a; }
                .node-val.accent { color: #6366f1; }
                .node-val.status-critical { color: #ef4444; }
                .node-val.status-normal { color: #22c55e; }

                .matrix-body-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }

                .matrix-section {
                    border-bottom: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                    padding: 0;
                }

                .matrix-section.full { grid-column: span 2; }
                .matrix-section.highlight { background: #fdfdfd; }

                .section-title-belt {
                    background: #f1f5f9;
                    padding: 0.4rem 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .belt-text { font-size: 0.6rem; font-weight: 800; color: #475569; letter-spacing: 0.05em; }

                .observations-content, .findings-stream-content {
                    padding: 1.5rem;
                    font-size: 0.9rem;
                    line-height: 1.6;
                    color: #334155;
                    white-space: pre-line;
                }

                .meta-info-list { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .meta-item { display: flex; justify-content: space-between; align-items: center; }
                .m-label { font-size: 0.65rem; color: #94a3b8; font-weight: 700; }
                .m-val { font-size: 0.75rem; font-weight: 800; color: #1e293b; }
                .m-val.billed { color: #22c55e; }
                .m-val.pending { color: #f59e0b; }

                .quartz-footer-telemetry {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    font-weight: 700;
                }

                .mono { font-family: 'JetBrains Mono', monospace; }

                /* Loading/Empty States */
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
                .compact-loader p { font-size: 0.65rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.2em; }
                .compact-empty-state { padding: 10rem; text-align: center; color: #cbd5e1; font-weight: 700; letter-spacing: 0.1em; }

                @media (max-width: 1024px) {
                    .quartz-console-layout { border: none; }
                    .biometric-header-quartz { flex-direction: column; text-align: center; }
                    .subject-stats-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .matrix-body-grid { grid-template-columns: 1fr; }
                    .matrix-section.full { grid-column: span 1; }
                    .matrix-info-belt { grid-template-columns: 1fr 1fr; }
                    .quartz-top-actions { padding: 1rem 1.5rem; }
                    .quartz-main-scrollable { padding: 1.5rem; }
                }
            `}</style>
        </>
    );
}
