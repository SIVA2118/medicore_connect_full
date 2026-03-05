import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import LabNavbar from "../../components/LabNavbar";
import "../../styles/lab/Report.css";

export default function Report() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/lab/reports", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setReports(res.data.reports || []);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                alert("Session expired or invalid. Please logout and login again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r =>
        (r.patient?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (r.testName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <LabNavbar />
            <div className="compact-slate-workstation">
                <div className="precision-dots-background"></div>

                <div className="compact-sticky-header">
                    <div className="compact-header-content">
                        <div className="hub-identity">
                            <span className="hub-dot"></span>
                            <h2>Diagnostic <span className="slate-accent">Archive</span></h2>
                        </div>
                        <div className="compact-search-container">
                            <i className="micro-search-icon">🔍</i>
                            <input
                                type="text"
                                placeholder="QUICK SEARCH ARCHIVE (PATIENT/TEST)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="compact-search-input"
                            />
                        </div>
                        <div className="system-stats-bit">
                            RECORDS: <span className="mono">{filteredReports.length}</span>
                        </div>
                    </div>
                </div>

                <div className="compact-grid-scroller">
                    {loading ? (
                        <div className="compact-loader">
                            <div className="micro-spinner"></div>
                            <p>SYNCHRONIZING_LAB_MATRIX...</p>
                        </div>
                    ) : (
                        <div className="compact-reports-grid">
                            {filteredReports.map((report, index) => (
                                <div
                                    className="small-report-card"
                                    key={report._id}
                                    style={{ animationDelay: `${index * 0.04}s` }}
                                    onClick={() => {
                                        if (report.isVerified) {
                                            navigate(`/lab/report/view/${report._id}`);
                                        } else {
                                            navigate("/lab/create-report", { state: { report } });
                                        }
                                    }}
                                >
                                    <div className="card-top-bar">
                                        <div className={`compact-status ${report.isVerified ? 'verified' : 'pending'}`}></div>
                                        <span className="report-id-short">UID-{report._id.slice(-4).toUpperCase()}</span>
                                    </div>

                                    <h4 className="card-mini-title">{report.testName.toUpperCase()}</h4>

                                    <div className="card-row">
                                        <span className="row-label">PATIENT</span>
                                        <span className="row-val truncate">{report.patient?.name?.toUpperCase() || "MISSING"}</span>
                                    </div>

                                    <div className="card-row">
                                        <span className="row-label">DOCTOR</span>
                                        <span className="row-val truncate">DR. {report.doctor?.name?.split(' ')[0].toUpperCase() || "AUTO"}</span>
                                    </div>

                                    <div className="card-meta-bottom">
                                        <span className="date-tag mono">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        <div className="mini-badge-type">{report.testType}</div>
                                    </div>

                                    <div className="card-hover-actions">
                                        <button className="btn-mini-action">
                                            {report.isVerified ? "OPEN" : "PROCESS"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {filteredReports.length === 0 && (
                                <div className="compact-empty-state">
                                    <p>ZERO_RECORDS_MATCHED</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

                .compact-slate-workstation {
                    background: #f1f5f9;
                    min-height: 100vh;
                    position: relative;
                    font-family: 'JetBrains Mono', monospace;
                    color: #1e293b;
                    overflow-x: hidden;
                    padding: 0;
                }

                .precision-dots-background {
                    position: fixed;
                    inset: 0;
                    background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
                    background-size: 24px 24px;
                    opacity: 0.3;
                    pointer-events: none;
                }

                .compact-sticky-header {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    background: rgba(255, 255, 255, 0.9);
                    border-bottom: 2px solid #e2e8f0;
                    padding: 1.5rem 3rem;
                    backdrop-filter: blur(20px);
                    display: flex;
                    flex-direction: column;
                }

                .compact-header-content {
                    max-width: 1600px;
                    margin: 0 auto;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .hub-identity {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .hub-dot {
                    width: 10px;
                    height: 10px;
                    background: #6366f1;
                    border-radius: 2px;
                }

                .hub-identity h2 {
                    margin: 0;
                    font-size: 1.25rem;
                    font-weight: 700;
                    letter-spacing: -0.05em;
                }

                .slate-accent { color: #64748b; font-weight: 400; }

                .compact-search-container {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    width: 450px;
                    border-radius: 6px;
                    transition: all 0.3s;
                }

                .compact-search-container:focus-within {
                    border-color: #6366f1;
                    background: #ffffff;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
                }

                .compact-search-input {
                    border: none;
                    background: transparent;
                    flex: 1;
                    padding: 0.4rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #1e293b;
                    font-family: inherit;
                }

                .compact-search-input:focus { outline: none; }

                .system-stats-bit {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 0.05em;
                }

                .compact-grid-scroller {
                    padding: 2.5rem 3rem;
                    max-width: 1600px;
                    margin: 0 auto;
                    position: relative;
                }

                .compact-reports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .small-report-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    padding: 1.5rem;
                    position: relative;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    min-height: 230px;
                    animation: cardPop 0.5s ease backwards;
                }

                @keyframes cardPop {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .small-report-card:hover {
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.08);
                    border-color: #6366f1;
                    transform: translateY(-5px);
                }

                .card-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .compact-status {
                    width: 30px;
                    height: 4px;
                    border-radius: 2px;
                    background: #e2e8f0;
                }

                .compact-status.verified { background: #22c55e; }
                .compact-status.pending { background: #f59e0b; }

                .report-id-short { font-size: 0.65rem; font-weight: 700; color: #94a3b8; }
                .card-mini-title { margin: 0; font-size: 1rem; font-weight: 800; color: #0f172a; line-height: 1.2; letter-spacing: -0.02em; }
                .card-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; }
                .row-label { color: #94a3b8; font-weight: 500; }
                .row-val { color: #475569; font-weight: 700; max-width: 160px; text-align: right; }
                .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

                .card-meta-bottom {
                    margin-top: auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1rem;
                    border-top: 1px dashed #e2e8f0;
                }

                .date-tag { font-size: 0.65rem; color: #94a3b8; font-weight: 600; }
                .mini-badge-type {
                    font-size: 0.6rem;
                    background: #f1f5f9;
                    padding: 0.3rem 0.6rem;
                    border-radius: 4px;
                    font-weight: 800;
                    color: #475569;
                }

                .card-hover-actions {
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    opacity: 0;
                    transition: opacity 0.3s;
                    backdrop-filter: blur(4px);
                }

                .small-report-card:hover .card-hover-actions { opacity: 1; }

                .btn-mini-action {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.25rem;
                    font-size: 0.7rem;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.3s;
                }

                .btn-mini-action:hover { background: #6366f1; transform: scale(1.05); }

                .compact-empty-state { padding: 5rem; text-align: center; color: #cbd5e1; font-weight: 700; letter-spacing: 0.1em; }
                .mono { font-family: 'JetBrains Mono', monospace; }

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

                @media (max-width: 1024px) {
                    .compact-sticky-header { padding: 1.25rem 2rem; }
                    .compact-search-container { width: 100%; margin-top: 1rem; }
                    .compact-grid-scroller { padding: 1.5rem 2rem; }
                }
            `}</style>
        </>
    );
}
