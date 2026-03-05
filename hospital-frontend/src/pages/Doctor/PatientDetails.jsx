import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/Doctor/PatientDetails.css";

export default function PatientDetails() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const role = localStorage.getItem("role");

    const [selectedReports, setSelectedReports] = useState([]); // Array of { type, id }
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState("");
    const [activeTab, setActiveTab] = useState("overview"); // overview, history, appointment

    useEffect(() => {
        fetchPatient();
    }, [patientId]);

    const fetchPatient = async () => {
        try {
            const token = localStorage.getItem("token");
            const endpoint = role === "admin"
                ? `http://localhost:5000/api/admin/patient/${patientId}`
                : `http://localhost:5000/api/doctor/patient/${patientId}`;

            const res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = role === "admin" ? res.data : res.data;
            setPatient(data);
            if (data.nextAppointment) {
                setAppointmentDate(new Date(data.nextAppointment).toISOString().split('T')[0]);
            }
        } catch (err) {
            console.error("Failed to fetch patient");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAppointment = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.patch(`http://localhost:5000/api/doctor/patient/${patientId}/next-appointment`,
                { nextAppointment: appointmentDate },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Appointment updated successfully");
            setShowAppointmentModal(false);
            fetchPatient();
        } catch (error) {
            console.error("Failed to update appointment", error);
            alert("Failed to update appointment");
        }
    };

    const toggleSelection = (type, id) => {
        setSelectedReports(prev => {
            const exists = prev.find(item => item.type === type && item.id === id);
            if (exists) {
                return prev.filter(item => item.type !== type || item.id !== id);
            } else {
                return [...prev, { type, id }];
            }
        });
    };

    const handlePrintSelected = async () => {
        if (selectedReports.length === 0) {
            alert("Please select at least one report to print.");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await axios.post(
                `http://localhost:5000/api/doctor/pdf/batch`,
                { items: selectedReports },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Create blob link
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);

            // Create an iframe to trigger print system
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);

            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                // Cleanup after print dialog handles it
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.URL.revokeObjectURL(url);
                }, 3000); // Wait 3s to ensure print dialog is handled
            };

        } catch (error) {
            console.error("Error generating batch PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    if (loading) return <div className="loading-state">Loading patient profile...</div>;
    if (!patient) return <div className="error-state">Patient not found</div>;

    return (
        <>
            {role === "admin" && <AdminNavbar />}
            <div className="patient-details-wrapper">
                <div className="patient-details-container">
                    {/* HEADER */}
                    <header className="details-header">
                        <div className="patient-summary">
                            <div className="patient-avatar">{(patient.name || "?").charAt(0)}</div>
                            <div className="header-text">
                                <h2>{patient.name}</h2>
                                <p className="sub-detail">
                                    <span className="tag">{patient.gender}</span>
                                    <span className="tag">{patient.age} Years</span>
                                    <span className="tag blood">{patient.bloodGroup || "O+"}</span>
                                </p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <button className="btn-secondary" onClick={() => navigate(-1)}>Back</button>
                            {selectedReports.length > 0 && (
                                <button className="btn-primary" onClick={handlePrintSelected} style={{ background: '#e74c3c', borderColor: '#c0392b' }}>
                                    🖨️ Print Selected ({selectedReports.length})
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="tab-menu" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '2px solid var(--slate-100)', paddingBottom: '0.5rem' }}>
                        <button className={`menu-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            � Overview
                        </button>
                        <button className={`menu-tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                            � Medical History
                        </button>
                        <button className={`menu-tab-btn ${activeTab === 'appointment' ? 'active' : ''}`} onClick={() => setActiveTab('appointment')}>
                            📅 Set Appointment
                        </button>
                    </div>

                    <div className="details-body">

                        {/* ACTION BAR */}
                        {activeTab === 'overview' && role === "doctor" && (
                            <div className="quick-actions-bar" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <button className="action-btn report" onClick={() => navigate(`/doctor/report/create/${patientId}`)}>
                                    📝 Create Clinical Report
                                </button>
                                <button className="action-btn prescription" onClick={() => navigate(`/doctor/prescription/create/${patientId}`)}>
                                    💊 Issue Prescription
                                </button>
                            </div>
                        )}

                        {/* APPOINTMENT MODAL */}
                        {showAppointmentModal && (
                            <div className="modal-overlay">
                                <div className="modal-content">
                                    <h3>Set Next Appointment</h3>
                                    <div className="form-group">
                                        <label>Select Date</label>
                                        <input
                                            type="date"
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>
                                    {appointmentDate && (
                                        <div className="day-preview">
                                            <strong>Day:</strong> {new Date(appointmentDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </div>
                                    )}
                                    <div className="modal-actions">
                                        <button className="btn-save" onClick={handleUpdateAppointment}>Save Appointment</button>
                                        <button className="btn-cancel" onClick={() => setShowAppointmentModal(false)}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OVERVIEW CONTENT */}
                        {activeTab === 'overview' && (
                            <>
                                {/* PERSONAL INFO GRID */}
                                <div className="info-grid" style={{ marginBottom: '2rem' }}>
                                    <div className="info-card">
                                        <h3>Contact Information</h3>
                                        <p><strong>Phone:</strong> {patient.phone}</p>
                                        <p><strong>Email:</strong> {patient.email || "N/A"}</p>
                                        <p><strong>Address:</strong> {patient.address?.line1}, {patient.address?.city}, {patient.address?.state} - {patient.address?.pincode}</p>
                                        <p><strong>Assigned Physician:</strong> {patient.assignedDoctor?.name} ({patient.assignedDoctor?.specialization})</p>
                                    </div>
                                    <div className="info-card">
                                        <h3>Emergency Contact</h3>
                                        <p><strong>Name:</strong> {patient.emergencyContact?.name || "N/A"}</p>
                                        <p><strong>Relation:</strong> {patient.emergencyContact?.relation || "N/A"}</p>
                                        <p><strong>Phone:</strong> {patient.emergencyContact?.phone || "N/A"}</p>
                                    </div>
                                </div>

                                {/* MEDICAL OVERVIEW */}
                                <div className="medical-sections" style={{ marginBottom: '2rem' }}>
                                    <div className="med-box">
                                        <h4>Existing Conditions</h4>
                                        <ul>
                                            {patient.existingConditions?.length > 0 ? (
                                                patient.existingConditions.map((c, i) => <li key={i}>{c}</li>)
                                            ) : <li>No conditions recorded</li>}
                                        </ul>
                                    </div>
                                    <div className="med-box">
                                        <h4>Allergies</h4>
                                        <ul>
                                            {patient.allergies?.length > 0 ? (
                                                patient.allergies.map((a, i) => <li key={i}>{a}</li>)
                                            ) : <li>No allergies recorded</li>}
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* APPOINTMENT CONTENT */}
                        {activeTab === 'appointment' && (
                            <div className="appointment-section" style={{
                                background: 'white',
                                padding: '3rem',
                                borderRadius: '20px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--slate-100)',
                                textAlign: 'center'
                            }}>
                                <div className="appointment-status-header" style={{ marginBottom: '2.5rem' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                                    <h2 style={{ color: 'var(--primary-800)', fontSize: '1.8rem' }}>Patient Appointment Management</h2>
                                    <p style={{ color: 'var(--slate-500)' }}>Manage follow-up visits and scheduling</p>
                                </div>

                                <div className="current-appointment-box" style={{
                                    background: 'var(--slate-50)',
                                    padding: '2rem',
                                    borderRadius: '16px',
                                    display: 'inline-block',
                                    minWidth: '350px',
                                    marginBottom: '2.5rem',
                                    border: '1px solid var(--slate-200)'
                                }}>
                                    <h4 style={{ color: 'var(--slate-500)', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>Scheduled Next Visit</h4>
                                    {patient.nextAppointment ? (
                                        <div className="appointment-details-large">
                                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-700)' }}>
                                                {new Date(patient.nextAppointment).toLocaleDateString('en-GB')}
                                            </div>
                                            <div style={{ fontSize: '1.2rem', color: 'var(--primary-500)', fontWeight: '600' }}>
                                                {new Date(patient.nextAppointment).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--slate-400)', fontStyle: 'italic', padding: '1rem' }}>
                                            No appointment currently scheduled.
                                        </div>
                                    )}
                                </div>

                                {role === "doctor" && (
                                    <div className="appointment-actions">
                                        <button
                                            className="action-btn next-appointment"
                                            onClick={() => setShowAppointmentModal(true)}
                                            style={{
                                                background: 'var(--primary-600)',
                                                color: 'white',
                                                padding: '1.2rem 3rem',
                                                fontSize: '1.1rem',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.2)'
                                            }}
                                        >
                                            {patient.nextAppointment ? "📝 Reschedule Appointment" : "📅 Set New Appointment"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* HISTORY CONTENT */}
                        {activeTab === 'history' && (
                            <div className="history-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                                {/* REPORTS */}
                                <div className="history-section">
                                    <h3 style={{ color: 'var(--primary-800)', borderBottom: '2px solid var(--primary-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Medical Reports History</h3>
                                    {patient.reports?.length > 0 ? (
                                        <div className="history-list">
                                            {patient.reports.map(report => (
                                                <div key={report._id} className="history-card-item" onClick={() => toggleSelection('report', report._id)}>
                                                    <div className="item-left">
                                                        <input
                                                            type="checkbox"
                                                            name="reportSelect"
                                                            checked={selectedReports.some(r => r.type === 'report' && r.id === report._id)}
                                                            onChange={() => toggleSelection('report', report._id)}
                                                            style={{ marginRight: '1rem', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                        />
                                                        <span className="date-badge">{new Date(report.date).toLocaleDateString()}</span>
                                                        <div className="item-info">
                                                            <strong>{report.reportTitle}</strong>
                                                            <span className="doc-name">Dr. {report.doctor?.name}</span>
                                                        </div>
                                                    </div>
                                                    <span className="arrow-btn" onClick={(e) => { e.stopPropagation(); navigate(role === "admin" ? `/admin/report/view/${report._id}` : `/doctor/report/view/${report._id}`); }}>View →</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No medical reports found.</p>}
                                </div>

                                {/* PRESCRIPTIONS */}
                                <div className="history-section">
                                    <h3 style={{ color: 'var(--accent-800)', borderBottom: '2px solid var(--accent-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Prescription History</h3>
                                    {patient.prescriptions?.length > 0 ? (
                                        <div className="history-list">
                                            {patient.prescriptions.map(pres => (
                                                <div key={pres._id} className="history-card-item" onClick={() => toggleSelection('prescription', pres._id)}>
                                                    <div className="item-left">
                                                        <input
                                                            type="checkbox"
                                                            name="reportSelect"
                                                            checked={selectedReports.some(r => r.type === 'prescription' && r.id === pres._id)}
                                                            onChange={() => toggleSelection('prescription', pres._id)}
                                                            style={{ marginRight: '1rem', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                        />
                                                        <span className="date-badge" style={{ background: 'var(--accent-50)', color: 'var(--accent-700)' }}>{new Date(pres.createdAt).toLocaleDateString()}</span>
                                                        <div className="item-info">
                                                            <strong>{pres.diagnosis || "General Consultation"}</strong>
                                                            <span className="doc-name">Dr. {pres.doctor?.name}</span>
                                                        </div>
                                                    </div>
                                                    <span className="arrow-btn" style={{ color: 'var(--accent-600)' }} onClick={(e) => { e.stopPropagation(); navigate(role === "admin" ? `/admin/prescription/view/${pres._id}` : `/doctor/prescription/view/${pres._id}`); }}>View →</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No prescriptions found.</p>}
                                </div>

                                {/* LABS */}
                                <div className="history-section" style={{ marginTop: '1rem' }}>
                                    <h3 style={{ color: 'var(--blue-800)', borderBottom: '2px solid var(--blue-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Lab History</h3>
                                    {patient.labReports?.length > 0 ? (
                                        <div className="history-list">
                                            {patient.labReports.map(item => (
                                                <div
                                                    key={item._id}
                                                    className="history-card-item scan-item"
                                                    onClick={() => toggleSelection('lab-report', item._id)}
                                                >
                                                    <div className="item-left">
                                                        <input
                                                            type="checkbox"
                                                            name="reportSelect"
                                                            checked={selectedReports.some(r => r.type === 'lab-report' && r.id === item._id)}
                                                            onChange={() => toggleSelection('lab-report', item._id)}
                                                            style={{ marginRight: '1rem', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                        />
                                                        <span className="date-badge" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
                                                            {new Date(item.testDate).toLocaleDateString()}
                                                        </span>
                                                        <div className="item-info">
                                                            <strong>{item.testName} ({item.testType})</strong>
                                                            <span className="doc-name">
                                                                Req by: Dr. {item.doctor?.name || "N/A"} |
                                                                Status: <span style={{ fontWeight: 'bold', color: item.isVerified ? 'green' : 'orange' }}>{item.isVerified ? 'Verified' : 'Pending'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="arrow-btn" style={{ color: 'var(--blue-600)' }} onClick={(e) => { e.stopPropagation(); navigate(role === "admin" ? `/admin/lab-report/view/${item._id}` : `/doctor/lab-report/view/${item._id}`); }}>View →</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No lab history found.</p>}
                                </div>

                                {/* SCANS */}
                                <div className="history-section" style={{ marginTop: '1rem' }}>
                                    <h3 style={{ color: 'var(--teal-800)', borderBottom: '2px solid var(--teal-100)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Scan History</h3>
                                    {patient.scanReports?.length > 0 ? (
                                        <div className="history-list">
                                            {patient.scanReports.map(item => (
                                                <div
                                                    key={item._id}
                                                    className="history-card-item scan-item"
                                                    onClick={() => toggleSelection('scan-report', item._id)}
                                                >
                                                    <div className="item-left">
                                                        <input
                                                            type="checkbox"
                                                            name="reportSelect"
                                                            checked={selectedReports.some(r => r.type === 'scan-report' && r.id === item._id)}
                                                            onChange={() => toggleSelection('scan-report', item._id)}
                                                            style={{ marginRight: '1rem', cursor: 'pointer', transform: 'scale(1.2)' }}
                                                        />
                                                        <span className="date-badge" style={{ background: 'var(--teal-50)', color: 'var(--teal-700)' }}>
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <div className="item-info">
                                                            <strong>{item.scanName} ({item.type})</strong>
                                                            <span className="doc-name">
                                                                Req by: Dr. {item.doctor?.name || "N/A"} |
                                                                Status: <span style={{ fontWeight: 'bold', color: item.isVerified ? 'green' : 'orange' }}>{item.isVerified ? 'Verified' : 'Pending'}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="arrow-btn" style={{ color: 'var(--teal-600)' }} onClick={(e) => { e.stopPropagation(); navigate(role === "admin" ? `/admin/scan-report/view/${item._id}` : `/doctor/scan-report/view/${item._id}`); }}>View →</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="empty-text" style={{ color: 'var(--slate-400)', fontStyle: 'italic' }}>No scan history found.</p>}
                                </div>

                            </div>
                        )}

                        <style>{`
                        .history-card-item {
                            background: white;
                            border: 1px solid var(--slate-200);
                            padding: 1rem;
                            border-radius: 12px;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 0.75rem;
                            cursor: pointer;
                            transition: all 0.2s ease;
                        }
                        .history-card-item:hover {
                            border-color: var(--primary-300);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                            transform: translateX(4px);
                        }
                        .item-left {
                            display: flex;
                            gap: 1rem;
                            align-items: center;
                        }
                        .date-badge {
                            background: var(--primary-50);
                            color: var(--primary-700);
                            padding: 0.35rem 0.75rem;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 0.85rem;
                            min-width: 100px;
                            text-align: center;
                        }
                        .item-info {
                            display: flex;
                            flex-direction: column;
                        }
                        .doc-name {
                            font-size: 0.8rem;
                            color: var(--slate-500);
                        }
                        .arrow-btn {
                            font-weight: 600;
                            color: var(--primary-600);
                        }
                    `}</style>
                    </div>
                </div>
            </div>
        </>
    );
}
