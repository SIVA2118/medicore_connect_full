import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo-white.png';
import '../../styles/Receptionist/ReceptionistProfile.css';

const ReceptionistIdCard = ({ receptionist, onClose }) => {
    const cardRef = useRef(null);



    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${receptionist.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        }
    };

    return (
        <div className="rec-card-overlay">
            <div className="rec-card-modal">
                <div className="rec-card-actions">

                    <button onClick={handleDownload} className="rec-action-btn" title="Download">📥 Download</button>
                    <button onClick={onClose} className="rec-close-btn" title="Close">✖</button>
                </div>

                <div className="rec-cards-container" ref={cardRef}>
                    {/* FRONT SIDE */}
                    <div className="rec-card-wrapper">
                        <div className="rec-card rec-card-front">
                            <div className="rec-header-shape"></div>

                            <div className="rec-card-header rec-centered-header">
                                <div className="rec-logo-stack">
                                    <img src={logo} alt="Logo" className="rec-logo-img" />
                                    <div className="rec-logo-text">
                                        <h3>NS MULTISPECIALITY HOSPITAL</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="rec-card-content">
                                <div className="rec-photo-section">
                                    <div className="rec-photo-circle">
                                        {receptionist.profileImage ? (
                                            <img src={receptionist.profileImage} alt="Profile" />
                                        ) : (
                                            <div className="rec-photo-placeholder">{receptionist.name?.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="rec-info-main">
                                    <h2 className="rec-info-name">{receptionist.name?.toUpperCase()}</h2>
                                    <div className="rec-info-role">RECEPTIONIST</div>
                                </div>

                                <div className="rec-info-grid">
                                    <div className="rec-detail-row">
                                        <span className="rec-detail-label">Employee ID:</span>
                                        <span className="rec-detail-value">{receptionist.employeeId || `ECH-${receptionist._id?.substr(-4).toUpperCase()}`}</span>
                                    </div>
                                    <div className="rec-detail-row">
                                        <span className="rec-detail-label">Blood Group:</span>
                                        <span className="rec-detail-value">{receptionist.bloodGroup || "O+"}</span>
                                    </div>
                                    <div className="rec-detail-row">
                                        <span className="rec-detail-label">Date of Issue:</span>
                                        <span className="rec-detail-value">{new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rec-footer-shape"></div>
                        </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="rec-card-wrapper">
                        <div className="rec-card rec-card-back">
                            <div className="rec-header-shape-back"></div>

                            <div className="rec-card-header rec-back-header">
                                <div className="rec-logo-small">
                                    <img src={logo} alt="Logo" className="rec-logo-img" style={{ height: '50px' }} />
                                </div>
                            </div>

                            <div className="rec-card-content rec-back-content">
                                <div className="rec-emergency-bar">
                                    EMERGENCY CONTACT:
                                </div>
                                <div className="rec-emergency-info">
                                    <p><strong>Name:</strong> {receptionist.emergencyContactName || "Not Set"}</p>
                                    <p><strong>Phone:</strong> {receptionist.emergencyContactPhone || "Not Set"}</p>
                                </div>

                                <div className="rec-hospital-grid">
                                    <div className="rec-h-row">
                                        <span className="rec-h-label">Hospital Address:</span>
                                        <span className="rec-h-value">123, Main Road, Coimbatore - 641001</span>
                                    </div>
                                    <div className="rec-h-row">
                                        <span className="rec-h-label">Phone:</span>
                                        <span className="rec-h-value">9942129724</span>
                                    </div>
                                    <div className="rec-h-row">
                                        <span className="rec-h-label">Email:</span>
                                        <span className="rec-h-value">info@nsmultispecialityhospital.com</span>
                                    </div>
                                    <div className="rec-h-row">
                                        <span className="rec-h-label">Website:</span>
                                        <span className="rec-h-value">www.nsmultispecialityhospital.com</span>
                                    </div>
                                </div>

                                <div className="rec-note-bar">
                                    NOTE:
                                </div>
                                <ul className="rec-policy-list">
                                    <li>This ID card is property of NS Multispeciality Hospital.</li>
                                </ul>


                            </div>

                            <div className="rec-footer-shape-back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceptionistIdCard;
