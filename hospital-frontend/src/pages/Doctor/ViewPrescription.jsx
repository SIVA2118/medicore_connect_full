import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/Doctor/Report.css";
import "../../styles/Doctor/Prescriptions.css"; // Reuse table styles

export default function ViewPrescription() {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    useEffect(() => {
        fetchPrescription();
    }, [prescriptionId]);

    const fetchPrescription = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/doctor/prescription/${prescriptionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrescription(res.data);
        } catch (err) {
            console.error("Failed to fetch prescription");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-state">Loading prescription...</div>;
    if (!prescription) return <div className="error-state">Prescription not found</div>;

    return (
        <>
            {role === "admin" && <AdminNavbar />}
            <div className="report-container">
                <div className="report-card preview-mode" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid var(--slate-100)', paddingBottom: '1rem' }}>
                        <div>
                            <h1 style={{ color: 'var(--primary-800)', fontSize: '1.8rem' }}>Prescription</h1>
                            <p style={{ color: 'var(--slate-500)' }}>Date: {new Date(prescription.createdAt).toLocaleString()}</p>
                        </div>
                        <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
                    </header>

                    <div className="report-body">
                        <section className="report-section">
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Patient Details</h3>
                            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '12px' }}>
                                <p><strong>Name:</strong> {prescription.patient?.name}</p>
                                <p><strong>Age:</strong> {prescription.patient?.age}</p>
                            </div>
                        </section>

                        <section className="report-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Clinical Notes</h3>
                            <div className="content-box" style={{ background: 'var(--slate-50)', padding: '1.5rem', borderRadius: '12px' }}>
                                <p><strong>Diagnosis:</strong> {prescription.diagnosis || "N/A"}</p>
                                <p><strong>symptoms:</strong> {prescription.symptoms || "N/A"}</p>
                            </div>
                        </section>

                        <section className="report-section" style={{ marginTop: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Medicines</h3>
                            <div className="table-wrapper">
                                <table className="medicines-table">
                                    <thead>
                                        <tr>
                                            <th>Medicine Name</th>
                                            <th>Dosage</th>
                                            <th>Frequency</th>
                                            <th>Duration</th>
                                            <th>Time</th>
                                            <th>Instruction</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prescription.medicines?.map((med, index) => (
                                            <tr key={index}>
                                                <td><strong style={{ color: 'var(--primary-900)' }}>{med.name}</strong></td>
                                                <td>{med.dosage}</td>
                                                <td>{med.frequency}</td>
                                                <td>{med.duration}</td>
                                                <td>
                                                    <span style={{
                                                        background: 'var(--accent-50)',
                                                        color: 'var(--accent-700)',
                                                        padding: '0.25rem 0.6rem',
                                                        borderRadius: '100px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {med.partOfDay}
                                                    </span>
                                                </td>
                                                <td>{med.mealInstruction}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {prescription.notes && (
                            <section className="report-section" style={{ marginTop: '2rem' }}>
                                <h3 style={{ color: 'var(--primary-700)', marginBottom: '1rem' }}>Additional Notes</h3>
                                <div className="content-box" style={{ background: 'var(--yellow-50)', padding: '1.5rem', borderRadius: '12px', color: 'var(--yellow-900)' }}>
                                    <p>{prescription.notes}</p>
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
                                    onClick={() => navigate(`/doctor/prescription/edit/${prescription._id}`)}
                                >
                                    Edit Prescription
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
                                        if (window.confirm("Are you sure you want to delete this prescription? This action cannot be undone.")) {
                                            try {
                                                const token = localStorage.getItem("token");
                                                await axios.delete(`http://localhost:5000/api/doctor/prescription/${prescriptionId}`, {
                                                    headers: { Authorization: `Bearer ${token}` }
                                                });
                                                alert("Prescription deleted successfully");
                                                navigate(-1);
                                            } catch (err) {
                                                alert("Failed to delete prescription");
                                            }
                                        }
                                    }}
                                >
                                    Delete Prescription
                                </button>
                            </div>
                            <span style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                                Digitally signed by Dr. {prescription.doctor?.name} ({prescription.doctor?.specialization})
                            </span>
                        </div>
                    )}
                    {role === "admin" && (
                        <div className="actions" style={{ marginTop: '3rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', textAlign: 'right' }}>
                            <span style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                                Filed by Dr. {prescription.doctor?.name} ({prescription.doctor?.specialization})
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
