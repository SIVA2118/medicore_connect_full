import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPatientHistory } from "../../api/public";

export default function VerifyPatient() {
    const [searchParams] = useSearchParams();
    const [patient, setPatient] = useState(null);
    const [history, setHistory] = useState({
        reports: [],
        prescriptions: [],
        scanReports: [],
        labReports: [],
        bills: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState('bills'); // summary, reports, prescriptions, diagnostics, bills

    useEffect(() => {
        const loadPatientData = async () => {
            try {
                const encodedData = searchParams.get("data");

                if (encodedData) {
                    const decodedData = JSON.parse(atob(encodedData));
                    console.log("Decoded Patient Data:", decodedData);

                    // Fetch live history from backend
                    if (decodedData.id) {
                        try {
                            const res = await fetchPatientHistory(decodedData.id);
                            if (res.data.success) {
                                setPatient(res.data.patient);
                                setHistory(res.data.history);
                            } else {
                                // Fallback to decoded data if API fails but data exists
                                setPatient(decodedData);
                            }
                        } catch (apiErr) {
                            console.warn("API history fetch failed, using URL data:", apiErr);
                            setPatient(decodedData);
                        }
                    } else {
                        setPatient(decodedData);
                    }
                } else {
                    setError("No patient data found.");
                }
            } catch (err) {
                console.error("Error decoding data:", err);
                setError("Invalid patient data.");
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
    }, [searchParams]);

    const formatAddress = (addr) => {
        if (!addr) return "N/A";
        // Handle if address is just a string or object
        if (typeof addr === 'string') return addr;
        const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode];
        return parts.filter(p => p).join(", ");
    };

    const formatDate = (dateString, includeTime = false) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit' })
        });
    };

    const handleDownload = (doc) => {
        if (doc.url && !doc.isDynamic) {
            // Real static download link
            window.open(doc.url, '_blank');
        } else if (doc.isDynamic) {
            // Dynamic PDF generation via public API
            const baseUrl = window.location.origin.replace('3000', '5000'); // Assuming backend is on 5000
            window.open(`${baseUrl}/api/public/view-pdf/${doc.type}/${doc.id}`, '_blank');
        } else {
            // Simulated download
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent("Sample Data for " + doc.name);
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const CountdownTimer = ({ targetDate }) => {
        const calculateTimeLeft = () => {
            const difference = +new Date(targetDate) - +new Date();
            let timeLeft = {};

            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return timeLeft;
        };

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

        useEffect(() => {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);
            return () => clearInterval(timer);
        }, [targetDate]);

        if (Object.keys(timeLeft).length === 0) {
            return <div className="timer-finished" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Appointment Time!</div>;
        }

        return (
            <div className="countdown-display">
                <div className="time-unit">
                    <span className="value">{timeLeft.days}</span>
                    <span className="label">Days</span>
                </div>
                <div className="time-unit">
                    <span className="value">{timeLeft.hours}</span>
                    <span className="label">Hrs</span>
                </div>
                <div className="time-unit">
                    <span className="value">{timeLeft.minutes}</span>
                    <span className="label">Min</span>
                </div>
                <div className="time-unit">
                    <span className="value">{timeLeft.seconds}</span>
                    <span className="label">Sec</span>
                </div>
            </div>
        );
    };

    if (loading) return <div className="verify-container">Verifying...</div>;
    if (error) return <div className="verify-container error">{error}</div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'reports':
                return (
                    <div className="history-list">
                        {history.reports.length > 0 ? history.reports.map((report, idx) => (
                            <div key={idx} className="history-item">
                                <div className="item-header">
                                    <h4>{report.reportTitle}</h4>
                                    <span className="date">{formatDate(report.date)}</span>
                                </div>
                                <div className="item-body">
                                    <p><strong>Doctor:</strong> {report.doctor?.name} ({report.doctor?.specialization})</p>
                                    <p><strong>Diagnosis:</strong> {report.diagnosis || "N/A"}</p>
                                    <p><strong>Symptoms:</strong> {report.symptoms?.join(", ") || "N/A"}</p>
                                    <button
                                        className="view-btn"
                                        onClick={() => handleDownload({ type: 'report', id: report._id, isDynamic: true })}
                                    >
                                        View Clinical Report
                                    </button>
                                </div>
                            </div>
                        )) : <p className="empty-msg">No medical reports found.</p>}
                    </div>
                );
            case 'prescriptions':
                return (
                    <div className="history-list">
                        {history.prescriptions.length > 0 ? history.prescriptions.map((pres, idx) => (
                            <div key={idx} className="history-item">
                                <div className="item-header">
                                    <h4>Prescription {pres.prescriptionNo || `#${idx + 1}`}</h4>
                                    <span className="date">{formatDate(pres.createdAt)}</span>
                                </div>
                                <div className="item-body">
                                    <p><strong>Doctor:</strong> {pres.doctor?.name}</p>
                                    <div className="medicine-list">
                                        {pres.medicines.map((m, midx) => (
                                            <div key={midx} className="medicine-tag">
                                                {m.name} - {m.dosage} ({m.frequency})
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        className="view-btn"
                                        style={{ marginTop: '1rem' }}
                                        onClick={() => handleDownload({ type: 'prescription', id: pres._id, isDynamic: true })}
                                    >
                                        View Prescription
                                    </button>
                                </div>
                            </div>
                        )) : <p className="empty-msg">No prescriptions found.</p>}
                    </div>
                );
            case 'diagnostics':
                return (
                    <div className="history-list">
                        <div className="sub-section">
                            <h5>Scan Reports</h5>
                            {history.scanReports.length > 0 ? history.scanReports.map((scan, idx) => (
                                <div key={idx} className="history-item diagnostic">
                                    <div className="item-header">
                                        <h4>{scan.scanName} ({scan.type})</h4>
                                        <div className="item-actions">
                                            <span className="status">{scan.resultStatus}</span>
                                            <button
                                                className="view-btn sm"
                                                onClick={() => handleDownload({ type: 'scan-report', id: scan._id, isDynamic: true })}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                    <span className="date">{formatDate(scan.scanDate)}</span>
                                </div>
                            )) : <p className="empty-msg">No scan reports found.</p>}
                        </div>
                        <div className="sub-section" style={{ marginTop: '1.5rem' }}>
                            <h5>Lab Reports</h5>
                            {history.labReports.length > 0 ? history.labReports.map((lab, idx) => (
                                <div key={idx} className="history-item diagnostic">
                                    <div className="item-header">
                                        <h4>{lab.testName}</h4>
                                        <div className="item-actions">
                                            <span className="status">{lab.resultStatus}</span>
                                            <button
                                                className="view-btn sm"
                                                onClick={() => handleDownload({ type: 'lab-report', id: lab._id, isDynamic: true })}
                                            >
                                                View
                                            </button>
                                        </div>
                                    </div>
                                    <span className="date">{formatDate(lab.testDate)}</span>
                                </div>
                            )) : <p className="empty-msg">No lab reports found.</p>}
                        </div>
                    </div>
                );
            case 'bills':
                return (
                    <div className="history-list">
                        {history.bills && history.bills.length > 0 ? history.bills.map((bill, idx) => (
                            <div key={idx} className="history-item bill-record">
                                <div className="bill-main">
                                    <div className="bill-title-row">
                                        <h4>{bill.treatment}</h4>
                                        <span className={`status ${bill.paid ? 'success' : 'warning'}`}>
                                            {bill.paid ? 'PAID' : 'PENDING'}
                                        </span>
                                        <button
                                            className="view-btn sm"
                                            onClick={() => handleDownload({ type: 'bill', id: bill._id, isDynamic: true })}
                                        >
                                            View Bill
                                        </button>
                                    </div>
                                    <div className="bill-meta-row">
                                        <span className="bill-id-badge">ID: #{bill._id.substring(bill._id.length - 6).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="bill-details-column">
                                    <p><strong>Amount:</strong> Rs. {bill.amount}</p>
                                    <p><strong>Doctor:</strong> {bill.doctor?.name || "N/A"}</p>
                                    <span className="date">{formatDate(bill.createdAt, true)}</span>
                                </div>
                            </div>
                        )) : <p className="empty-msg">No billing history found.</p>}
                    </div>
                );
            case 'appointments':
                return (
                    <div className="history-list">
                        <div className="history-item appointment-record" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                            <div className="item-header">
                                <h4>Scheduled Next Visit</h4>
                                <span className={`status ${patient.nextAppointment ? 'success' : 'neutral'}`}>
                                    {patient.nextAppointment ? 'SCHEDULED' : 'NOT SET'}
                                </span>
                            </div>
                            <div className="item-body" style={{ padding: '1.5rem', textAlign: 'center' }}>
                                {patient.nextAppointment ? (
                                    <div className="appointment-display">
                                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                                            {formatDate(patient.nextAppointment)}
                                        </div>
                                        <div style={{ fontSize: '1.2rem', color: 'var(--text-light)', fontWeight: '600' }}>
                                            {new Date(patient.nextAppointment).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </div>
                                        <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
                                            Please present this verification at the hospital reception on the date of your visit.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="empty-msg">No upcoming appointments scheduled at this moment.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            default: // summary
                return (
                    <div className="summary-view">
                        <div className="summary-stats">
                            <div className="stat-box">
                                <span className="label">Total Reports</span>
                                <span className="value">{history.reports.length}</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">Prescriptions</span>
                                <span className="value">{history.prescriptions.length}</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">Diagnostic Tests</span>
                                <span className="value">{history.scanReports.length + history.labReports.length}</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">Bills</span>
                                <span className="value">{history.bills?.length || 0}</span>
                            </div>
                        </div>
                        <div className="recent-activity">
                            <h4>Recent Clinical Activity</h4>
                            {history.reports.length > 0 ? (
                                <div className="activity-card">
                                    <div className="activity-icon">📅</div>
                                    <div className="activity-info">
                                        <p className="activity-title">Latest Consultation</p>
                                        <p className="activity-desc">{history.reports[0].reportTitle} with {history.reports[0].doctor?.name}</p>
                                        <span className="activity-date">{formatDate(history.reports[0].date)}</span>
                                    </div>
                                </div>
                            ) : <p className="empty-msg">No recent activity recorded.</p>}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="verify-dashboard">
            {/* Full Width Top Header */}
            <header className="main-header">
                <div className="container header-content">
                    <div className="logo-section">
                        <h1>MEDICORE CONNECT</h1>
                        <span className="subtitle">Patient Health Record Verification</span>
                    </div>
                    <div className="header-badge">
                        <span className="badge-icon">✔</span> Identity Verified
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="container dashboard-grid">
                    {/* 0. Appointment TImer Card (Flashy Header Card) */}
                    {patient.nextAppointment && (
                        <div className="dash-card timer-card full-width-card">
                            <div className="timer-content-layout">
                                <div className="timer-icon-side" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="pulse-icon" style={{ marginBottom: 0 }}>📅</div>
                                    <div>
                                        <div className="next-visit-label">NEXT VISIT</div>
                                        <div className="status-badge-live" style={{ marginBottom: 0, marginTop: '2px' }}>LIVE</div>
                                    </div>
                                </div>
                                <div className="timer-main-side">
                                    <h2 className="appointment-date-header" style={{ marginBottom: '4px' }}>
                                        {formatDate(patient.nextAppointment)} ({new Date(patient.nextAppointment).toLocaleDateString('en-US', { weekday: 'short' })})
                                    </h2>
                                    <CountdownTimer targetDate={patient.nextAppointment} />
                                </div>
                                <div className="timer-action-side" style={{ textAlign: 'right' }}>
                                    <p className="timer-subtext">Arrive 15 mins early</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 1. Profile Card (Left) */}
                    <div className="dash-card profile-card">
                        <div className="profile-header">
                            <div className="avatar-large">
                                {(patient.name || "?").charAt(0)}
                            </div>
                            <h2 className="profile-name">{patient.name || "Unknown Patient"}</h2>
                            <p className="profile-id">MRN: {patient.mrn || patient.id.substring(patient.id.length - 6).toUpperCase()}</p>
                        </div>
                        <div className="profile-contact">
                            <div className="contact-row">
                                <span className="icon">📞</span>
                                <span>{patient.phone}</span>
                            </div>
                            <div className="contact-row">
                                <span className="icon">✉️</span>
                                <span>{patient.email || "No Email Registered"}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. General Information (Middle) */}
                    <div className="dash-card general-info">
                        <div className="card-header">
                            <h3>Patient Particulars</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <label>Age</label>
                                <p>{patient.age} Years</p>
                            </div>
                            <div className="info-row">
                                <label>Gender</label>
                                <p>{patient.gender}</p>
                            </div>
                            <div className="info-row">
                                <label>Residential Address</label>
                                <p className="address-text">{formatAddress(patient.address)}</p>
                            </div>
                            <div className="info-row">
                                <label>Emergency Contact</label>
                                <p>{patient.emergencyContact?.phone || patient.emergencyContact || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Medical Profile (Right) */}
                    <div className="dash-card medical-info">
                        <div className="card-header">
                            <h3>Medical Summary</h3>
                        </div>
                        <div className="info-list">
                            <div className="info-row">
                                <label>Blood Group</label>
                                <p className="highlight">{patient.bloodGroup || "N/A"}</p>
                            </div>
                            <div className="info-row">
                                <label>Known Conditions</label>
                                <div className="tags">
                                    {patient.history && patient.history.length > 0 && patient.history[0] !== "NO"
                                        ? (Array.isArray(patient.history[0]) ? patient.history[0] : patient.history).map((h, i) => <span key={i} className="tag warning">{h}</span>)
                                        : <span className="tag neutral">None Reported</span>
                                    }
                                </div>
                            </div>
                            <div className="info-row">
                                <label>Allergies</label>
                                <p>{patient.allergies?.join(", ") || "No known allergies"}</p>
                            </div>
                            <div className="info-row highlight-row">
                                <label>Next Appointment</label>
                                <p className="appointment-text">
                                    {patient.nextAppointment
                                        ? `${formatDate(patient.nextAppointment)} (${new Date(patient.nextAppointment).toLocaleDateString('en-US', { weekday: 'long' })})`
                                        : "Not Scheduled"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 4. Comprehensive Medical History */}
                    <div className="dash-card history-section">
                        <div className="tabs-header">
                            <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Summary</button>
                            <button className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>Reports</button>
                            <button className={`tab ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>Prescriptions</button>
                            <button className={`tab ${activeTab === 'diagnostics' ? 'active' : ''}`} onClick={() => setActiveTab('diagnostics')}>Diagnostics</button>
                            <button className={`tab ${activeTab === 'bills' ? 'active' : ''}`} onClick={() => setActiveTab('bills')}>Bills</button>
                            <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>Appointments</button>
                        </div>
                        <div className="tab-content">
                            {renderContent()}
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                :root {
                    --bg-page: #f8fafc;
                    --card-bg: #ffffff;
                    --primary: #0f172a;
                    --accent-blue: #3b82f6;
                    --accent-teal: #14b8a6;
                    --accent-rose: #f43f5e;
                    --text-main: #1e293b;
                    --text-light: #64748b;
                }

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html, body, #root {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    overflow-x: hidden;
                }

                .verify-dashboard {
                    min-height: 100vh;
                    background-color: #f1f5f9;
                    font-family: 'Inter', sans-serif;
                    color: var(--text-main);
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                .container {
                    width: 100% !important;
                    max-width: none !important;
                    padding: 0 1.5rem;
                    margin: 0 !important;
                }

                .full-width-card {
                    grid-column: 1 / -1;
                    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                    color: white !important;
                    border: none !important;
                    overflow: hidden;
                    position: relative;
                    padding: 0.75rem 1.5rem !important;
                }

                .full-width-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 100%;
                    background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
                    pointer-events: none;
                }

                .timer-content-layout {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    gap: 2rem;
                    align-items: center;
                    padding: 0;
                }

                .pulse-icon {
                    font-size: 2.2rem;
                    margin-bottom: 0.25rem;
                    animation: pulse-glow 2s infinite;
                }

                @keyframes pulse-glow {
                    0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(59, 130, 246, 0)); }
                }

                .next-visit-label {
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    color: #94a3b8;
                }

                .appointment-date-header {
                    font-size: 1.2rem;
                    margin-bottom: 0.5rem;
                    color: #f1f5f9;
                }

                .countdown-display {
                    display: flex;
                    gap: 1rem;
                }

                .time-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 0.4rem 0.75rem;
                    border-radius: 10px;
                    min-width: 65px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .time-unit .value {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #60a5fa;
                }

                .time-unit .label {
                    font-size: 0.6rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #64748b;
                    margin-top: 0.15rem;
                }

                .status-badge-live {
                    background: #ef4444;
                    color: white;
                    padding: 0.3rem 0.8rem;
                    border-radius: 50px;
                    font-size: 0.7rem;
                    font-weight: 800;
                    display: inline-block;
                    margin-bottom: 0.5rem;
                    animation: blink 1s infinite;
                }

                @keyframes blink {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }

                .timer-subtext {
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 500;
                }

                @media (max-width: 1024px) {
                    .timer-content-layout {
                        grid-template-columns: 1fr;
                        text-align: center;
                        gap: 1.5rem;
                    }
                    .countdown-display {
                        justify-content: center;
                    }
                }

                .main-header {
                    background: var(--primary);
                    padding: 1.5rem 0;
                    color: white;
                    width: 100%;
                    margin: 0;
                }
                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    padding: 0 1.5rem;
                }
                .logo-section h1 { font-size: 1.25rem; font-weight: 800; margin: 0; letter-spacing: 1px; }
                .subtitle { font-size: 0.8rem; opacity: 0.7; font-weight: 500; }
                .header-badge {
                    background: rgba(20, 184, 166, 0.2);
                    color: #2dd4bf;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    border: 1px solid rgba(45, 212, 191, 0.3);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .dashboard-content { 
                    padding: 1.5rem 0.5rem; 
                    width: 100% !important;
                }

                .highlight-row {
                    background: #f0f9ff;
                    margin: 0.5rem -1rem;
                    padding: 0.75rem 1rem;
                    border-left: 4px solid var(--accent-blue);
                }
                .appointment-text {
                    color: var(--accent-blue);
                    font-weight: 700;
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    width: 100% !important;
                }

                .dash-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border: 1px solid #f1f5f9;
                }

                .profile-card { text-align: center; }
                .avatar-large {
                    width: 80px; height: 80px;
                    background: #eff6ff;
                    color: #3b82f6;
                    border-radius: 50%;
                    margin: 0 auto 1rem;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 2rem; font-weight: 800;
                }
                .profile-name { font-size: 1.25rem; font-weight: 700; margin: 0; }
                .profile-id { font-size: 0.85rem; color: #64748b; margin-top: 0.25rem; font-weight: 600; }
                .profile-contact { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
                .contact-row {
                    display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem;
                    background: #f8fafc; padding: 0.6rem; border-radius: 8px;
                }

                .card-header h3 { font-size: 1rem; font-weight: 700; margin-bottom: 1.25rem; color: #475569; }
                .info-row { margin-bottom: 1rem; }
                .info-row label { display: block; font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 0.25rem; }
                .info-row p { margin: 0; font-weight: 600; font-size: 0.95rem; }
                .highlight { color: var(--accent-rose); font-size: 1.2rem !important; }

                .tag { padding: 0.25rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
                .tag.warning { background: #fff1f2; color: #e11d48; }
                .tag.neutral { background: #f1f5f9; color: #64748b; }

                /* History Section */
                .history-section { grid-column: span 2; }
                .tabs-header { display: flex; gap: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
                .tab {
                    background: none; border: none; padding: 0.75rem 0; font-weight: 600; color: #94a3b8;
                    cursor: pointer; position: relative; transition: all 0.2s;
                }
                .tab.active { color: #3b82f6; }
                .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #3b82f6; }

                .history-list { display: flex; flex-direction: column; gap: 1rem; }
                .history-item { padding: 1rem; background: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; }
                .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                .item-header h4 { margin: 0; font-size: 1rem; color: #1e293b; }
                .date { font-size: 0.8rem; color: #94a3b8; }
                 .status { font-size: 0.7rem; font-weight: 700; background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 4px; }
                 .status.success { background: #ecfdf5; color: #059669; }
                 .status.warning { background: #fffbeb; color: #d97706; }
                .item-body p { margin: 0.25rem 0; font-size: 0.85rem; color: #475569; }
                .medicine-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
                .medicine-tag { background: #eff6ff; color: #3b82f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }

                .summary-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
                .stat-box { background: #f8fafc; padding: 1rem; border-radius: 12px; text-align: center; }
                .stat-box .label { display: block; font-size: 0.7rem; color: #94a3b8; font-weight: 700; }
                .stat-box .value { font-size: 1.25rem; font-weight: 800; color: #1e293b; }

                .activity-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; }
                .activity-icon { font-size: 1.5rem; }
                .activity-title { font-weight: 700; margin: 0; font-size: 0.95rem; }
                .activity-desc { font-size: 0.85rem; color: #64748b; margin: 0.2rem 0; }
                .activity-date { font-size: 0.75rem; color: #94a3b8; }

                .files-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .file-item {
                    display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem;
                    background: #f8fafc; border-radius: 8px; cursor: pointer; transition: background 0.2s;
                }
                .file-item:hover { background: #f1f5f9; }
                .file-icon { font-size: 1.2rem; }
                .file-details { flex: 1; }
                .file-name { display: block; font-size: 0.85rem; font-weight: 600; }
                .file-size { font-size: 0.7rem; color: #94a3b8; }
                .file-action { font-size: 0.9rem; }

                .empty-msg { text-align: center; padding: 2rem; color: #94a3b8; font-size: 0.9rem; font-style: italic; }

                .view-btn {
                    background: #f1f5f9;
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #3b82f6;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-top: 0.75rem;
                    width: fit-content;
                }
                .view-btn:hover { background: #e2e8f0; color: #2563eb; }
                .view-btn.sm { padding: 0.25rem 0.75rem; font-size: 0.75rem; margin-top: 0; }
                .item-actions { display: flex; align-items: center; gap: 0.75rem; }

                .bill-record {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 1.5rem;
                }
                .bill-main { flex: 1; }
                .bill-details-column { text-align: right; min-width: 200px; }
                .bill-title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
                .bill-title-row h4 { margin: 0; font-size: 1.1rem; }
                .bill-id-badge { font-size: 0.8rem; color: #64748b; font-weight: 600; background: #f1f5f9; padding: 0.2rem 0.6rem; border-radius: 4px; }
                .bill-details-column p { margin: 0.25rem 0; font-size: 0.9rem; }

                @media (max-width: 600px) {
                    .bill-record { flex-direction: column; gap: 1rem; }
                    .bill-details-column { text-align: left; min-width: auto; }
                }
            `}</style>
        </div>
    );
}
