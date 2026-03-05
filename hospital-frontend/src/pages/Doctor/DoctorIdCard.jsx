import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo-white.png';
import '../../styles/Doctor/DoctorProfile.css';

const DoctorIdCard = ({ doctor, onClose }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${doctor.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        }
    };

    return (
        <div className="doc-card-overlay">
            <div className="doc-card-modal">
                <div className="doc-card-actions">
                    <button onClick={handleDownload} className="doc-action-btn" title="Download">📥 Download</button>
                    <button onClick={onClose} className="doc-close-btn" title="Close">✖</button>
                </div>

                <div className="doc-cards-container" ref={cardRef}>
                    {/* FRONT SIDE */}
                    <div className="doc-card-wrapper">
                        <div className="doc-card doc-card-front">
                            <div className="doc-header-shape"></div>

                            <div className="doc-card-header doc-centered-header">
                                <div className="doc-logo-stack">
                                    <img src={logo} alt="Logo" className="doc-logo-img" />
                                    <div className="doc-logo-text">
                                        <h3>NS MULTISPECIALITY HOSPITAL</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-card-content">
                                <div className="doc-photo-section">
                                    <div className="doc-photo-circle">
                                        {doctor.profileImage ? (
                                            <img src={doctor.profileImage} alt="Profile" />
                                        ) : (
                                            <div className="doc-photo-placeholder">{doctor.name?.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="doc-info-main">
                                    <h2 className="doc-info-name">{doctor.name?.toUpperCase()}</h2>
                                    <div className="doc-info-role">DOCTOR</div>
                                </div>

                                <div className="doc-info-grid">
                                    <div className="doc-detail-row">
                                        <span className="doc-detail-label">Employee ID:</span>
                                        <span className="doc-detail-value">{doctor.employeeId || `DOC-${doctor._id?.substr(-4).toUpperCase()}`}</span>
                                    </div>
                                    <div className="doc-detail-row">
                                        <span className="doc-detail-label">Blood Group:</span>
                                        <span className="doc-detail-value">{doctor.bloodGroup || "O+"}</span>
                                    </div>
                                    <div className="doc-detail-row">
                                        <span className="doc-detail-label">Date of Issue:</span>
                                        <span className="doc-detail-value">{new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="doc-footer-shape"></div>
                        </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="doc-card-wrapper">
                        <div className="doc-card doc-card-back">
                            <div className="doc-header-shape-back"></div>

                            <div className="doc-card-header doc-back-header">
                                <div className="doc-logo-small">
                                    <img src={logo} alt="Logo" className="doc-logo-img" style={{ height: '50px' }} />
                                </div>
                            </div>

                            <div className="doc-card-content doc-back-content">
                                <div className="doc-emergency-bar">
                                    EMERGENCY CONTACT:
                                </div>
                                <div className="doc-emergency-info">
                                    <p><strong>Name:</strong> {doctor.emergencyContactName || "Not Set"}</p>
                                    <p><strong>Phone:</strong> {doctor.emergencyContactPhone || "Not Set"}</p>
                                </div>

                                <div className="doc-hospital-grid">
                                    <div className="doc-h-row">
                                        <span className="doc-h-label">Hospital Address:</span>
                                        <span className="doc-h-value">123, Main Road, Coimbatore - 641001</span>
                                    </div>
                                    <div className="doc-h-row">
                                        <span className="doc-h-label">Phone:</span>
                                        <span className="doc-h-value">9942129724</span>
                                    </div>
                                    <div className="doc-h-row">
                                        <span className="doc-h-label">Email:</span>
                                        <span className="doc-h-value">info@nsmultispecialityhospital.com</span>
                                    </div>
                                    <div className="doc-h-row">
                                        <span className="doc-h-label">Website:</span>
                                        <span className="doc-h-value">www.nsmultispecialityhospital.com</span>
                                    </div>
                                </div>

                                <div className="doc-note-bar">
                                    NOTE:
                                </div>
                                <ul className="doc-policy-list">
                                    <li>This ID card is property of NS Multispeciality Hospital.</li>
                                </ul>

                            </div>

                            <div className="doc-footer-shape-back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorIdCard;
