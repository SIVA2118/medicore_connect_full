import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/Doctor/Report.css";

export default function ViewReport() {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/doctor/report/${reportId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReport(res.data);
        } catch (err) {
            console.error("Failed to fetch report");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading report...</div>;
    if (!report) return <div className="error-state">Report not found</div>;

    return (
        <>
            {role === "admin" && <AdminNavbar />}
            <div className="report-container">
                <div className="report-card preview-mode" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid var(--slate-100)', paddingBottom: '1rem' }}>
                        <div>
                            <h1 style={{ color: 'var(--primary-800)', fontSize: '1.8rem' }}>{report.reportTitle}</h1>
                            <p style={{ color: 'var(--slate-500)' }}>Date: {new Date(report.date).toLocaleString()}</p>
                        </div>
                        <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
                    </header>

                    <div className="report-body">
                        <section className="report-section">
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Patient Details</h3>
                            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '12px' }}>
                                <p><strong>Name:</strong> {report.patient?.name}</p>
                                <p><strong>Age/Gender:</strong> {report.patient?.age} / {report.patient?.gender}</p>
                            </div>
                        </section>

                        <section className="report-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Vitals & Measurements</h3>
                            <div className="vitals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                                <div className="vital-item" style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-500)' }}>BP</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{report.vitals?.bloodPressure || "--"}</strong>
                                </div>
                                <div className="vital-item" style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-500)' }}>Pulse</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{report.vitals?.pulseRate || "--"} bpm</strong>
                                </div>
                                <div className="vital-item" style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-500)' }}>Temp</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{report.vitals?.temperature || "--"} °F</strong>
                                </div>
                                <div className="vital-item" style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-500)' }}>O2 Level</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{report.vitals?.oxygenLevel || "--"} %</strong>
                                </div>
                                <div className="vital-item" style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--slate-500)' }}>Weight</span>
                                    <strong style={{ fontSize: '1.2rem' }}>{report.vitals?.weight || "--"} kg</strong>
                                </div>
                            </div>
                        </section>

                        <section className="report-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Clinical Observations</h3>
                            <div className="content-box" style={{ background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '12px' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <strong>Symptoms:</strong>
                                    <p style={{ marginTop: '0.5rem' }}>{report.symptoms?.length > 0 ? report.symptoms.join(", ") : "None recorded"}</p>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <strong>Physical Examination:</strong>
                                    <p style={{ marginTop: '0.5rem' }}>{report.physicalExamination || "No notes"}</p>
                                </div>
                                <div>
                                    <strong>Clinical Findings:</strong>
                                    <p style={{ marginTop: '0.5rem' }}>{report.clinicalFindings || "No findings recorded"}</p>
                                </div>
                            </div>
                        </section>

                        <section className="report-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Diagnosis & Details</h3>
                            <div className="content-box" style={{ background: 'white', border: '1px solid var(--slate-200)', padding: '1.5rem', borderRadius: '12px' }}>
                                <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}><strong>Final Diagnosis:</strong> {report.diagnosis || "Pending"}</p>
                                <hr style={{ border: '0', borderTop: '1px solid var(--slate-100)', margin: '1rem 0' }} />
                                <p><strong>Comprehensive Report Details:</strong></p>
                                <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', color: 'var(--slate-700)' }}>{report.reportDetails}</p>
                            </div>
                        </section>

                        <section className="report-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Plan & Advice</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="content-box" style={{ background: 'var(--primary-50)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <strong>Treatment Advice:</strong>
                                    <p style={{ marginTop: '0.5rem' }}>{report.treatmentAdvice || "None"}</p>
                                </div>
                                <div className="content-box" style={{ background: 'var(--accent-50)', padding: '1.5rem', borderRadius: '12px' }}>
                                    <strong>Lifestyle Advice:</strong>
                                    <p style={{ marginTop: '0.5rem' }}>{report.lifestyleAdvice || "None"}</p>
                                </div>
                            </div>
                            <div className="content-box" style={{ background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem' }}>
                                <strong>Advised Investigations:</strong>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                                    {report.advisedInvestigations?.length > 0 ? (
                                        report.advisedInvestigations.map((inv, i) => <li key={i}>{inv}</li>)
                                    ) : <li>None advised</li>}
                                </ul>
                            </div>
                        </section>

                        {(report.followUpDate || report.additionalNotes) && (
                            <section className="report-section" style={{ marginTop: '2rem' }}>
                                <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Follow-up & Notes</h3>
                                <div className="content-box" style={{ border: '1px dashed var(--slate-300)', padding: '1.5rem', borderRadius: '12px' }}>
                                    {report.followUpDate && (
                                        <p style={{ marginBottom: '1rem' }}><strong>Follow-up Date:</strong> {new Date(report.followUpDate).toLocaleDateString()}</p>
                                    )}
                                    {report.additionalNotes && (
                                        <p><strong>Additional Notes:</strong> {report.additionalNotes}</p>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {role === "doctor" && (
                        <div className="actions" style={{ marginTop: '3rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: 'var(--primary-600)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                    onClick={() => navigate(`/doctor/report/edit/${report._id}`)}
                                >
                                    Edit Report
                                </button>
                                <button
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        background: 'white',
                                        color: 'var(--state-error)',
                                        border: '1px solid var(--state-error)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                    onClick={async () => {
                                        if (window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
                                            try {
                                                const token = localStorage.getItem("token");
                                                await axios.delete(`http://localhost:5000/api/doctor/report/${reportId}`, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                alert("Report deleted successfully");
                                                navigate(-1);
                                            } catch (err) {
                                                alert("Failed to delete report");
                                            }
                                        }
                                    }}
                                >
                                    Delete Report
                                </button>
                            </div>
                            <span style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                                Digitally signed by Dr. {report.doctor?.name} ({report.doctor?.specialization})
                            </span>
                        </div>
                    )}
                    {role === "admin" && (
                        <div className="actions" style={{ marginTop: '3rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', textAlign: 'right' }}>
                            <span style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                                Filed by Dr. {report.doctor?.name} ({report.doctor?.specialization})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
