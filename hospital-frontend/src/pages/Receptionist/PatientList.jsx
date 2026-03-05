import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Added
import QRCode from "react-qr-code";
import "../../styles/Receptionist/PatientList.css";
import ReceptionistNavbar from "../../components/ReceptionistNavbar";

export default function PatientList() {
    const navigate = useNavigate(); // Added
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // ID Card Modal State
    const [showIdCard, setShowIdCard] = useState(false);
    const [selectedPatientIdCard, setSelectedPatientIdCard] = useState(null);

    const [selectedDate, setSelectedDate] = useState("");
    const [filterType, setFilterType] = useState("All"); // Added Filter State

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/receptionist/all-patients", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setPatients(res.data.patients);
            }
        } catch (err) {
            console.error("Failed to fetch patients", err);
        } finally {
            setLoading(false);
        }
    };

    const openIdCard = (e, patient) => {
        e.stopPropagation();
        setSelectedPatientIdCard(patient);
        setShowIdCard(true);
    };

    // Filter by Search, Date & Type
    const filteredBySearch = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search)
    );

    const filteredByDate = filteredBySearch.filter((p) => {
        // Date Filter
        if (selectedDate) {
            const pDate = new Date(p.createdAt).toISOString().split("T")[0];
            if (pDate !== selectedDate) return false;
        }
        // Type Filter
        if (filterType !== "All" && p.patientType !== filterType) return false;

        return true;
    });

    // Split into OPD and IPD
    const opdPatients = filteredByDate.filter((p) => p.patientType === "OPD");
    const ipdPatients = filteredByDate.filter((p) => p.patientType === "IPD");

    // DELETE FUNCTION
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (!window.confirm("Are you sure you want to delete this patient?")) return;

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/receptionist/patient/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPatients(patients.filter((p) => p._id !== id)); // Remove from UI
            alert("Patient deleted successfully");
        } catch (err) {
            console.error("Failed to delete patient", err);
            alert("Failed to delete patient");
        }
    };

    // EDIT NAVIGATION
    const handleEdit = (e, patient) => {
        e.stopPropagation();
        navigate("/receptionist/add-patient", { state: { patient } });
    };

    // State for selected patient popup
    const [selectedPatient, setSelectedPatient] = useState(null);

    const closeModal = () => setSelectedPatient(null);

    const renderPatientCard = (p) => (
        <div className="patient-card-modern" key={p._id} onClick={() => setSelectedPatient(p)}>
            <div className="modern-card-header">
                <div className="modern-header-top">
                    <span className={`modern-badge ${p.patientType}`}>{p.patientType}</span>
                    <span className="patient-id-tag">#{p.mrn?.substring(p.mrn.length - 6) || "ID"}</span>
                </div>

                <div className="modern-avatar-section">
                    {p.profileImage ? (
                        <img src={p.profileImage} alt={p.name} className="modern-avatar" />
                    ) : (
                        <div className="modern-avatar-placeholder">{p.name.charAt(0)}</div>
                    )}
                </div>

                <h3 className="modern-patient-name">{p.name}</h3>
                <p className="modern-patient-sub">{p.age} Yrs • {p.gender}</p>
            </div>

            <div className="modern-card-body">
                <div className="modern-info-grid">
                    <div className="modern-info-item">
                        <span className="info-icon">📞</span>
                        <span className="info-value">{p.phone}</span>
                    </div>
                    <div className="modern-info-item">
                        <span className="info-icon">👨‍⚕️</span>
                        <span className="info-value doc-name">{p.assignedDoctor?.name || "No Doctor"}</span>
                    </div>

                    {/* Conditional Date Display */}
                    {p.patientType === "IPD" ? (
                        <>
                            <div className="modern-info-item">
                                <span className="info-icon">📅</span>
                                <span className="info-value">
                                    Admitted: {p.ipdDetails?.admissionDate ? new Date(p.ipdDetails.admissionDate).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                            <div className="modern-info-item">
                                <span className="info-icon">🏁</span>
                                <span className="info-value">
                                    Discharge: {p.ipdDetails?.dischargeDate ? new Date(p.ipdDetails.dischargeDate).toLocaleDateString() : "N/A"}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="modern-info-item">
                            <span className="info-icon">📅</span>
                            <span className="info-value">
                                Last Visit: {p.opdDetails?.lastVisitDate ? new Date(p.opdDetails.lastVisitDate).toLocaleDateString() : "N/A"}
                            </span>
                        </div>
                    )}

                    <div className="modern-info-item full-width">
                        <span className="info-icon">🏥</span>
                        <span className="info-value">{p.existingConditions || "No Conditions"}</span>
                    </div>
                </div>
            </div>

            <div className="modern-card-footer">
                <button className="modern-btn-primary" onClick={(e) => openIdCard(e, p)}>
                    <span>🆔</span> View ID
                </button>
                <div className="modern-actions-group">
                    <button className="modern-icon-btn edit" onClick={(e) => handleEdit(e, p)} title="Edit">
                        ✏️
                    </button>
                    <button className="modern-icon-btn delete" onClick={(e) => handleDelete(e, p._id)} title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <ReceptionistNavbar />
            <div className="patient-list-container">
                <div className="patient-list-header">
                    <div className="header-left">
                        <h2>Patient List</h2>
                        <input
                            type="date"
                            className="date-picker"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {/* TYPE FILTER DROPDOWN */}
                        <select
                            className="date-picker" // Reusing style for consistency
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            style={{ minWidth: '120px' }}
                        >
                            <option value="All">All Types</option>
                            <option value="OPD">OPD Only</option>
                            <option value="IPD">IPD Only</option>
                        </select>
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        className="search-bar"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p>Loading patients...</p>
                ) : (
                    <div className="split-layout">
                        {/* OPD COLUMN */}
                        <div className="column column-opd">
                            <h3 className="column-title">OPD Patients ({opdPatients.length})</h3>
                            <div className="patients-list">
                                {opdPatients.length === 0 ? (
                                    <p className="empty-msg">No OPD patients found for this date.</p>
                                ) : (
                                    opdPatients.map(renderPatientCard)
                                )}
                            </div>
                        </div>

                        {/* IPD COLUMN */}
                        <div className="column column-ipd">
                            <h3 className="column-title">IPD Patients ({ipdPatients.length})</h3>
                            <div className="patients-list">
                                {ipdPatients.length === 0 ? (
                                    <p className="empty-msg">No IPD patients found for this date.</p>
                                ) : (
                                    ipdPatients.map(renderPatientCard)
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* PATIENT DETAILS POPUP */}
                {selectedPatient && (
                    <div className="patient-modal-overlay" onClick={closeModal}>
                        <div className="patient-modal-content" onClick={(e) => e.stopPropagation()}>
                            <button className="close-btn" onClick={closeModal}>&times;</button>

                            <div className="modal-header">
                                {selectedPatient.profileImage ? (
                                    <img src={selectedPatient.profileImage} alt={selectedPatient.name} className="modal-avatar" />
                                ) : (
                                    <div className="modal-avatar-placeholder">{selectedPatient.name.charAt(0)}</div>
                                )}
                                <div>
                                    <h2>{selectedPatient.name}</h2>
                                    <span className={`badge ${selectedPatient.patientType}`}>{selectedPatient.patientType}</span>
                                </div>
                            </div>

                            <div className="modal-body">

                                {/* Personal Info */}
                                <div className="detail-section">
                                    <h3>Personal Information</h3>
                                    <div className="detail-grid">
                                        <p><strong>Age:</strong> {selectedPatient.age}</p>
                                        <p><strong>Gender:</strong> {selectedPatient.gender}</p>
                                        <p><strong>Date of Birth:</strong> {new Date(selectedPatient.dob).toLocaleDateString()}</p>
                                        <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                                        <p><strong>Email:</strong> {selectedPatient.email}</p>
                                        <p><strong>Blood Group:</strong> {selectedPatient.bloodGroup}</p>
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="detail-section">
                                    <h3>Address</h3>
                                    <p>
                                        {selectedPatient.address.line1}, {selectedPatient.address.line2 ? selectedPatient.address.line2 + "," : ""} <br />
                                        {selectedPatient.address.city}, {selectedPatient.address.state} - {selectedPatient.address.pincode}
                                    </p>
                                </div>

                                {/* Medical Info */}
                                <div className="detail-section">
                                    <h3>Medical History</h3>
                                    <div className="detail-grid">
                                        <p><strong>Conditions:</strong> {selectedPatient.existingConditions || "None"}</p>
                                        <p><strong>Allergies:</strong> {selectedPatient.allergies || "None"}</p>
                                        <p><strong>Current Meds:</strong> {selectedPatient.currentMedications || "None"}</p>
                                    </div>
                                </div>

                                {/* Appointment Info */}
                                <div className="detail-section">
                                    <h3>Appointment Details</h3>
                                    <div className="detail-grid">
                                        <p><strong>Assigned Doctor:</strong> {selectedPatient.assignedDoctor?.name || "Not Assigned"}</p>
                                        <p><strong>Reg Date:</strong> {new Date(selectedPatient.createdAt).toLocaleString()}</p>
                                        {selectedPatient.patientType === "IPD" && (
                                            <>
                                                <p><strong>Admission Date:</strong> {selectedPatient.ipdDetails?.admissionDate ? new Date(selectedPatient.ipdDetails.admissionDate).toLocaleDateString() : "N/A"}</p>
                                                <p><strong>Room/Ward:</strong> {selectedPatient.ipdDetails?.roomNumber || "Pending"}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="detail-section">
                                    <h3>Emergency Contact</h3>
                                    <div className="detail-grid">
                                        <p><strong>Name:</strong> {selectedPatient.emergencyContact?.name}</p>
                                        <p><strong>Relation:</strong> {selectedPatient.emergencyContact?.relation}</p>
                                        <p><strong>Phone:</strong> {selectedPatient.emergencyContact?.phone}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}

                {/* Patient ID Card Modal (Vaccination Style) */}
                {showIdCard && selectedPatientIdCard && (
                    <div className="modal-overlay" onClick={() => setShowIdCard(false)}>
                        <div className="id-card-wrapper" onClick={e => e.stopPropagation()}>
                            <div className="id-card-modal landscape">
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
                                                <p>{selectedPatientIdCard._id.substring(selectedPatientIdCard._id.length - 6).toUpperCase()}</p>
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
                                                    bloodGroup: selectedPatientIdCard.bloodGroup
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

                            {/* Action Buttons */}
                            <div className="id-card-actions">
                                <button className="btn-print" onClick={() => window.print()}>🖨️ Print Card</button>
                                <button className="btn-close-card" onClick={() => setShowIdCard(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                )
                }

            </div>
        </>
    );
}
