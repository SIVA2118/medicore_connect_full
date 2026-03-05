import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { LAB_TEST_MASTER } from "../../constants/labTestMaster";
import "../../styles/Doctor/MyPatients.css";

export default function MyPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const navigate = useNavigate();

    // Reassign Modal State
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedPatientForReassign, setSelectedPatientForReassign] = useState(null);
    const [doctorList, setDoctorList] = useState([]);
    const [newDoctorId, setNewDoctorId] = useState("");

    // ID Card Modal State
    const [showIdCard, setShowIdCard] = useState(false);
    const [selectedPatientIdCard, setSelectedPatientIdCard] = useState(null);

    // Scan Request Modal State
    const [showScanModal, setShowScanModal] = useState(false);
    const [selectedPatientForScan, setSelectedPatientForScan] = useState(null);
    const [scanners, setScanners] = useState([]);
    const [scanData, setScanData] = useState({ type: "X-Ray", scanName: "", description: "", assignedTo: "" });

    // Lab Request Modal State
    const [showLabModal, setShowLabModal] = useState(false);
    const [selectedPatientForLab, setSelectedPatientForLab] = useState(null);
    const [labs, setLabs] = useState([]);
    const [labData, setLabData] = useState({ testType: "Hematology", testName: "", description: "", assignedTo: "" });

    const fetchScanners = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/scanner/all-scanners", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setScanners(res.data.scanners);
            }
        } catch (err) {
            console.error("Failed to fetch scanners", err);
        }
    };

    const fetchLabs = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/lab/all-labs", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setLabs(res.data.labs);
            }
        } catch (err) {
            console.error("Failed to fetch labs", err);
        }
    };

    const openIdCard = (patient) => {
        setSelectedPatientIdCard(patient);
        setShowIdCard(true);
    };

    const openScanModal = (patient) => {
        setSelectedPatientForScan(patient);
        setScanData({ type: "X-Ray", scanName: "", description: "", assignedTo: "" });
        if (scanners.length === 0) fetchScanners();
        setShowScanModal(true);
    };

    const openLabModal = (patient) => {
        setSelectedPatientForLab(patient);
        setLabData({ testType: "Hematology", testName: "", description: "", assignedTo: "" });
        if (labs.length === 0) fetchLabs();
        setShowLabModal(true);
    };

    const handleScanSubmit = async () => {
        if (!scanData.scanName) return alert("Please enter a scan name");
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/scanner/scan-report", {
                patient: selectedPatientForScan._id,
                type: scanData.type,
                scanName: scanData.scanName,
                description: scanData.description,
                assignedTo: scanData.assignedTo,
                scanDate: new Date()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Scan request sent successfully!");
            setShowScanModal(false);
        } catch (err) {
            console.error("Failed to request scan", err);
            alert("Failed to create scan request");
        }
    };

    const handleLabSubmit = async () => {
        if (!labData.testName) return alert("Please enter a test name");
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/lab/report", {
                patient: selectedPatientForLab._id,
                testType: labData.testType,
                testName: labData.testName,
                description: labData.description,
                assignedTo: labData.assignedTo,
                testDate: new Date()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Lab test assigned successfully!");
            setShowLabModal(false);
        } catch (err) {
            console.error("Failed to assign lab test", err);
            alert("Failed to create lab request");
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/doctor/patients", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
        } catch (err) {
            console.error("Failed to fetch patients");
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/doctor/doctors", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctorList(res.data);
        } catch (err) {
            console.error("Failed to fetch doctors");
            alert("Could not load doctor list.");
        }
    };

    const openReassignModal = (patient) => {
        setSelectedPatientForReassign(patient);
        setNewDoctorId("");
        setShowReassignModal(true);
        if (doctorList.length === 0) {
            fetchDoctors();
        }
    };

    const handleReassignSubmit = async () => {
        if (!newDoctorId) return alert("Please select a doctor.");
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/doctor/reassign", {
                patientId: selectedPatientForReassign._id,
                newDoctorId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Patient reassigned successfully.");
            setShowReassignModal(false);
            fetchPatients(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Failed to reassign patient.");
        }
    };

    const filteredPatients = patients.filter(p => {
        // 1. Date Filter
        if (filterDate) {
            const regDate = new Date(p.createdAt).toDateString();
            const selectedDate = new Date(filterDate).toDateString();
            if (regDate !== selectedDate) return false;
        }

        // 2. Search Filter
        return (
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.phone && p.phone.includes(searchTerm)) ||
            (p.mrn && p.mrn.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p._id && p._id.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const opdPatients = filteredPatients.filter(p => p.patientType === "OPD" || !p.patientType);
    const ipdPatients = filteredPatients.filter(p => p.patientType === "IPD");

    const renderPatientCard = (p) => (
        <div className="patient-card" key={p._id} onClick={() => navigate(`/doctor/patient/${p._id}`)}>
            <div className="card-top">
                {p.profileImage ? (
                    <img src={p.profileImage} alt={p.name} className="avatar-img" />
                ) : (
                    <div className="avatar">{p.name.charAt(0)}</div>
                )}
                <div className="name-meta">
                    <h3>{p.name}</h3>
                    <p>{p.gender}, {p.age} years • #{p.mrn || "ID"}</p>
                </div>
                <div className="visit-badge">
                    {p.patientType === 'IPD' ? '🏥 IPD' : '🩺 OPD'}
                </div>
            </div>
            <div className="card-divider"></div>
            <div className="card-body">
                <p><strong>Condition:</strong> <span className="condition-tag">{p.existingConditions || "N/A"}</span></p>
                <p><strong>Last Visit:</strong> {p.lastReport ? new Date(p.lastReport.date).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "Never"}</p>
                {p.lastReport && <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>{p.lastReport.reportTitle}</p>}

                {/* Visual indicator for IPD Admitted Date if available */}
                {p.patientType === 'IPD' && p.ipdDetails?.admissionDate && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                        🛏️ Admitted: {new Date(p.ipdDetails.admissionDate).toLocaleDateString()}
                    </p>
                )}
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Reg: {new Date(p.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div className="card-actions">
                <button
                    className="action-btn btn-view-id"
                    onClick={(e) => { e.stopPropagation(); openIdCard(p); }}
                    title="View ID Card"
                >
                    🆔 View ID
                </button>

                <button
                    className="action-btn btn-scan"
                    onClick={(e) => { e.stopPropagation(); openScanModal(p); }}
                    title="Assign Scanner"
                >
                    📷 Scan
                </button>

                <button
                    className="action-btn"
                    onClick={(e) => { e.stopPropagation(); openLabModal(p); }}
                    title="Assign Lab Test"
                    style={{ backgroundColor: '#7c3aed', color: 'white' }}
                >
                    🧪 Lab
                </button>

                <button
                    className="action-btn btn-reassign"
                    onClick={(e) => { e.stopPropagation(); openReassignModal(p); }}
                    title="Reassign Patient"
                >
                    🔄 Reassign
                </button>
            </div>
        </div>
    );

    return (
        <div className="mypatients-page-wrapper">
            <div className="my-patients-container">
                <header className="patients-header">
                    <div>
                        <h2 style={{ color: "var(--primary-800)", marginBottom: '0.5rem' }}>Assigned Patients</h2>
                        <p style={{ color: 'var(--slate-500)' }}>{filterDate ? `Showing patients registered on ${new Date(filterDate).toDateString()}` : "Manage and view details of patients assigned to you."}</p>
                    </div>

                    <div className="search-bar-container" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="patient-search-input"
                            style={{ width: 'auto' }}
                        />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="patient-search-input"
                        />
                    </div>
                </header>

                {loading ? <div className="loading-state">Loading assigned patients...</div> : (
                    <div className="patients-split-container">
                        {/* LEFT: OPD SECTION */}
                        <div className="split-column opd-section">
                            <div className="section-header">
                                <h3 className="column-title opd">🩺 OPD Patients <span className="count-badge">{opdPatients.length}</span></h3>
                            </div>

                            <div className="patients-list-vertical">
                                {opdPatients.length === 0 ? (
                                    <p className="no-patients-small">No OPD patients.</p>
                                ) : opdPatients.map(renderPatientCard)}
                            </div>
                        </div>

                        {/* RIGHT: IPD SECTION */}
                        <div className="split-column ipd-section">
                            <div className="section-header">
                                <h3 className="column-title ipd">🏥 IPD Patients <span className="count-badge">{ipdPatients.length}</span></h3>
                            </div>

                            <div className="patients-list-vertical">
                                {ipdPatients.length === 0 ? (
                                    <p className="no-patients-small">No IPD patients.</p>
                                ) : ipdPatients.map(renderPatientCard)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reassign Modal */}
            {showReassignModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Reassign Patient</h3>
                        <p>Select a new doctor for <strong>{selectedPatientForReassign?.name}</strong></p>

                        <select
                            value={newDoctorId}
                            onChange={(e) => setNewDoctorId(e.target.value)}
                            className="modal-select"
                        >
                            <option value="">-- Select Doctor --</option>
                            {doctorList.map(doc => (
                                <option key={doc._id} value={doc._id}>
                                    {doc.name} ({doc.specialization})
                                    {doc.availability?.days?.length > 0
                                        ? ` [${doc.availability.days.join(", ")} | ${doc.availability.from} - ${doc.availability.to}]`
                                        : ""}
                                </option>
                            ))}
                        </select>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowReassignModal(false)}>Cancel</button>
                            <button className="btn-submit" onClick={handleReassignSubmit}>Confirm Reassignment</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scan Request Modal */}
            {
                showScanModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Request Scan</h3>
                            <p>Assign scan for <strong>{selectedPatientForScan?.name}</strong></p>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Scan Type</label>
                                <select
                                    value={scanData.type}
                                    onChange={(e) => setScanData({ ...scanData, type: e.target.value })}
                                    className="modal-select"
                                    style={{ marginTop: 0 }}
                                >
                                    <option>X-Ray</option>
                                    <option>CT Scan</option>
                                    <option>MRI</option>
                                    <option>Ultrasound</option>
                                    <option>Blood Test</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign Scanner (Optional)</label>
                                <select
                                    value={scanData.assignedTo}
                                    onChange={(e) => setScanData({ ...scanData, assignedTo: e.target.value })}
                                    className="modal-select"
                                    style={{ marginTop: 0 }}
                                >
                                    <option value="">-- Select Scanner --</option>
                                    {scanners.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Scan Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Chest X-Ray"
                                    value={scanData.scanName}
                                    onChange={(e) => setScanData({ ...scanData, scanName: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem' }}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description / Notes</label>
                                <textarea
                                    placeholder="Clinical indications..."
                                    value={scanData.description}
                                    onChange={(e) => setScanData({ ...scanData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px', minHeight: '80px' }}
                                ></textarea>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                <button className="btn-cancel" onClick={() => setShowScanModal(false)}>Cancel</button>
                                <button className="btn-submit" onClick={handleScanSubmit}>Send Request</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Lab Request Modal */}
            {
                showLabModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Assign Lab Test</h3>
                            <p>Assign test for <strong>{selectedPatientForLab?.name}</strong></p>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Test Type</label>
                                <select
                                    value={labData.testType}
                                    onChange={(e) => setLabData({
                                        ...labData,
                                        testType: e.target.value,
                                        testName: LAB_TEST_MASTER[e.target.value]?.[0] || "" // Reset test name to first option
                                    })}
                                    className="modal-select"
                                    style={{ marginTop: 0 }}
                                >
                                    {Object.keys(LAB_TEST_MASTER).map(key => (
                                        <option key={key} value={key}>{key.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign Lab (Optional)</label>
                                <select
                                    value={labData.assignedTo}
                                    onChange={(e) => setLabData({ ...labData, assignedTo: e.target.value })}
                                    className="modal-select"
                                    style={{ marginTop: 0 }}
                                >
                                    <option value="">-- Select Lab --</option>
                                    {labs.map(l => (
                                        <option key={l._id} value={l._id}>{l.name} ({l.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Test Name</label>
                                <select
                                    value={labData.testName}
                                    onChange={(e) => setLabData({ ...labData, testName: e.target.value })}
                                    className="modal-select"
                                    style={{ marginTop: 0 }}
                                    required
                                >
                                    <option value="">-- Select Test --</option>
                                    {LAB_TEST_MASTER[labData.testType]?.map(test => (
                                        <option key={test} value={test}>{test}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Instructions / Notes</label>
                                <textarea
                                    placeholder="Clinical notes..."
                                    value={labData.description}
                                    onChange={(e) => setLabData({ ...labData, description: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '8px', minHeight: '80px' }}
                                ></textarea>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                                <button className="btn-cancel" onClick={() => setShowLabModal(false)}>Cancel</button>
                                <button className="btn-submit" onClick={handleLabSubmit}>Assign Test</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Patient ID Card Modal (Vaccination Style) */}
            {
                showIdCard && selectedPatientIdCard && (
                    <div className="modal-overlay" onClick={() => setShowIdCard(false)}>
                        <div className="id-card-modal landscape" onClick={e => e.stopPropagation()}>
                            <div className="vax-card-header">
                                <div className="vax-title">
                                    <h4>PATIENT IDENTITY CARD</h4>
                                    <span>SAKRA WORLD HOSPITAL</span>
                                </div>
                                <div className="vax-status-badge">
                                    <div className="status-label">STATUS</div>
                                    <div className="status-value">
                                        <span className="check-icon">✔</span> ACTIVE
                                    </div>
                                </div>
                            </div>

                            <div className="vax-card-body">
                                <div className="vax-photo-section">
                                    <div className="vax-photo-frame">
                                        {selectedPatientIdCard.profileImage ? (
                                            <img src={selectedPatientIdCard.profileImage} alt="Patient" />
                                        ) : (
                                            <div className="vax-avatar-placeholder">{selectedPatientIdCard.name.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="vax-info-section">
                                    <div className="vax-row">
                                        <div className="vax-field">
                                            <label>Patient Name</label>
                                            <p>{selectedPatientIdCard.name}</p>
                                        </div>
                                        <div className="vax-field">
                                            <label>Patient ID</label>
                                            <p>{selectedPatientIdCard.mrn || selectedPatientIdCard._id.substring(selectedPatientIdCard._id.length - 6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="vax-divider"></div>

                                    <div className="vax-row">
                                        <div className="vax-field">
                                            <label>Age / Gender</label>
                                            <p>{selectedPatientIdCard.age} Yrs / {selectedPatientIdCard.gender}</p>
                                        </div>
                                        <div className="vax-field">
                                            <label>Blood Group</label>
                                            <p>{selectedPatientIdCard.bloodGroup || "N/A"}</p>
                                        </div>
                                        <div className="vax-field">
                                            <label>Phone</label>
                                            <p>{selectedPatientIdCard.phone}</p>
                                        </div>
                                    </div>

                                    <div className="vax-row">
                                        <div className="vax-field full-width">
                                            <label>Emergency Contact</label>
                                            <p>{selectedPatientIdCard.emergencyContact?.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="vax-card-footer">
                                <div className="vax-qr-section">
                                    <div className="qr-label">PATIENT INFO SCAN</div>
                                    <div className="qr-code-box">
                                        <QRCode
                                            value={`${window.location.origin}/verify-patient?data=${btoa(JSON.stringify({
                                                id: selectedPatientIdCard._id,
                                                name: selectedPatientIdCard.name,
                                                age: selectedPatientIdCard.age,
                                                gender: selectedPatientIdCard.gender,
                                                bloodGroup: selectedPatientIdCard.bloodGroup,
                                                phone: selectedPatientIdCard.phone,
                                                email: selectedPatientIdCard.email,
                                                address: selectedPatientIdCard.address,
                                                guardianName: selectedPatientIdCard.guardianName,
                                                guardianPhone: selectedPatientIdCard.guardianPhone,
                                                emergencyContact: selectedPatientIdCard.emergencyContact?.phone,
                                                history: selectedPatientIdCard.existingConditions ? [selectedPatientIdCard.existingConditions] : [],
                                                registrationDate: selectedPatientIdCard.registrationDate,
                                                documents: [
                                                    selectedPatientIdCard.latestBill ? {
                                                        name: selectedPatientIdCard.latestBill.pdfFile.split(/[/\\]/).pop(), // extract filename
                                                        size: "150kb",
                                                        type: "pdf",
                                                        url: `http://localhost:5000/api/biller/view-pdf/${selectedPatientIdCard.latestBill._id}` // Optional: if we want to support direct download link usage later
                                                    } : { name: `Bill_${selectedPatientIdCard.mrn || "Invoice"}.pdf`, size: "150kb", type: "pdf" }
                                                ]
                                            }))}`}
                                            size={160}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                </div>

                                <div className="vax-signature-section">
                                    <div className="vax-field">
                                        <label>Date of Issue</label>
                                        <p>{new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div className="vax-field">
                                        <label>Authorized Signature</label>
                                        <div className="signature-line">Sakra Admin</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style>{`
                .visit-badge {
                    margin-left: auto;
                    font-size: 0.8rem;
                    background: var(--primary-100);
                    color: var(--primary-700);
                    padding: 0.2rem 0.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    width: 400px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }
                .modal-select {
                    width: 100%;
                    padding: 0.8rem;
                    margin: 1.5rem 0;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
            `}</style>
        </div >
    );
}
