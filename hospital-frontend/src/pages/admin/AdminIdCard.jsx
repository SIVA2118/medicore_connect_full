import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo-white.png';
import '../../styles/admin/AdminProfile.css';

const AdminIdCard = ({ admin, onClose }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${admin.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        }
    };

    return (
        <div className="adm-card-overlay">
            <div className="adm-card-modal">
                <div className="adm-card-actions">
                    <button onClick={handleDownload} className="adm-action-btn" title="Download">📥 Download</button>
                    <button onClick={onClose} className="adm-close-btn" title="Close">✖</button>
                </div>

                <div className="adm-cards-container" ref={cardRef}>
                    {/* FRONT SIDE */}
                    <div className="adm-card-wrapper">
                        <div className="adm-card adm-card-front">
                            <div className="adm-header-shape"></div>

                            <div className="adm-card-header adm-centered-header">
                                <div className="adm-logo-stack">
                                    <img src={logo} alt="Logo" className="adm-logo-img" />
                                    <div className="adm-logo-text">
                                        <h3>NS MULTISPECIALITY HOSPITAL</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="adm-card-content">
                                <div className="adm-photo-section">
                                    <div className="adm-photo-circle">
                                        {admin.profileImage ? (
                                            <img src={admin.profileImage} alt="Profile" />
                                        ) : (
                                            <div className="avatar-placeholder">{admin.name?.charAt(0)}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="adm-info-main">
                                    <h2 className="adm-info-name">{admin.name?.toUpperCase()}</h2>
                                    <div className="adm-info-role">ADMINISTRATOR</div>
                                </div>

                                <div className="adm-info-grid">
                                    <div className="adm-detail-row">
                                        <span className="adm-detail-label">Employee ID:</span>
                                        <span className="adm-detail-value">{admin.employeeId || `ADM-01`}</span>
                                    </div>
                                    <div className="adm-detail-row">
                                        <span className="adm-detail-label">Blood Group:</span>
                                        <span className="adm-detail-value">{admin.bloodGroup || "O+"}</span>
                                    </div>
                                    <div className="adm-detail-row">
                                        <span className="adm-detail-label">Date of Issue:</span>
                                        <span className="adm-detail-value">{new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="adm-footer-shape"></div>
                        </div>
                    </div>

                    {/* BACK SIDE */}
                    <div className="adm-card-wrapper">
                        <div className="adm-card adm-card-back">
                            <div className="adm-card-header adm-back-header">
                                <img src={logo} alt="Logo" className="adm-logo-img" style={{ height: '50px' }} />
                            </div>

                            <div className="adm-back-content" style={{ marginTop: '120px', padding: '0 30px' }}>
                                <div className="adm-emergency-bar">EMERGENCY CONTACT:</div>
                                <div className="adm-emergency-info" style={{ marginBottom: '20px' }}>
                                    <p><strong>Name:</strong> {admin.emergencyContactName || "Not Set"}</p>
                                    <p><strong>Phone:</strong> {admin.emergencyContactPhone || "Not Set"}</p>
                                </div>

                                <div className="adm-hospital-grid">
                                    <div className="adm-h-row">
                                        <span className="adm-h-label">Address:</span>
                                        <span className="adm-h-value">123, Main Road, Coimbatore</span>
                                    </div>
                                    <div className="adm-h-row">
                                        <span className="adm-h-label">Phone:</span>
                                        <span className="adm-h-value">9942129724</span>
                                    </div>
                                </div>

                                <div className="adm-note-bar">NOTE:</div>
                                <p style={{ fontSize: '0.75rem', color: '#555' }}>This card is property of NS Multispeciality Hospital.</p>
                            </div>

                            <div className="adm-footer-shape-back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIdCard;
