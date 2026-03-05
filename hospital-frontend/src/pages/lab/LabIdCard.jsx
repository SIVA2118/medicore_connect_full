import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo-white.png';
import '../../styles/lab/LabProfile.css';

const LabIdCard = ({ lab, onClose }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${lab.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        }
    };

    return (
        <div className="lab-card-overlay">
            <div className="lab-card-modal">
                <div className="lab-card-actions">
                    <button onClick={handleDownload} className="lab-action-btn">📥 Download</button>
                    <button onClick={onClose} className="lab-close-btn">✖</button>
                </div>

                <div className="lab-cards-container" ref={cardRef}>
                    {/* FRONT */}
                    <div className="lab-card-wrapper">
                        <div className="lab-card lab-card-front">
                            <div className="lab-header-shape"></div>
                            <div className="lab-card-header">
                                <div className="lab-logo-stack" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={logo} alt="Logo" className="lab-logo-img" />
                                    <div className="lab-logo-text">
                                        <h3>NS MULTISPECIALITY HOSPITAL</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="lab-photo-section">
                                <div className="lab-photo-circle">
                                    {lab.profileImage ? (
                                        <img src={lab.profileImage} alt="Profile" />
                                    ) : (
                                        <div className="avatar-placeholder">{lab.name?.charAt(0)}</div>
                                    )}
                                </div>
                            </div>

                            <div className="lab-info-main">
                                <h2 className="lab-info-name">{lab.name?.toUpperCase()}</h2>
                                <div className="lab-info-role">LAB TECHNICIAN</div>
                            </div>

                            <div className="lab-info-grid">
                                <div className="lab-detail-row">
                                    <span className="lab-detail-label">Employee ID:</span>
                                    <span className="lab-detail-value">{lab.employeeId || `LAB-01`}</span>
                                </div>
                                <div className="lab-detail-row">
                                    <span className="lab-detail-label">Blood Group:</span>
                                    <span className="lab-detail-value">{lab.bloodGroup || "O+"}</span>
                                </div>
                                <div className="lab-detail-row">
                                    <span className="lab-detail-label">Date of Issue:</span>
                                    <span className="lab-detail-value">{new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="lab-footer-shape"></div>
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="lab-card-wrapper">
                        <div className="lab-card lab-card-back">
                            <div className="lab-back-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1a2c4e', height: '120px' }}>
                                <img src={logo} alt="Logo" style={{ height: '50px' }} />
                            </div>

                            <div className="lab-back-content" style={{ marginTop: '140px', padding: '0 30px', textAlign: 'center' }}>
                                <div className="lab-emergency-bar" style={{ fontWeight: '900', color: '#3b82f6', fontSize: '1.2rem' }}>EMERGENCY CONTACT:</div>
                                <p><strong>Name:</strong> {lab.emergencyContactName || "Not Set"}</p>
                                <p><strong>Phone:</strong> {lab.emergencyContactPhone || "Not Set"}</p>

                                <div className="lab-hospital-grid" style={{ marginTop: '20px', textAlign: 'left' }}>
                                    <div className="lab-h-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: '800' }}>Address:</span>
                                        <span style={{ color: '#555' }}>123, Main Road, Coimbatore</span>
                                    </div>
                                    <div className="lab-h-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: '800' }}>Phone:</span>
                                        <span style={{ color: '#555' }}>9942129724</span>
                                    </div>
                                </div>

                                <div className="lab-note-bar" style={{ background: '#3b82f6', color: 'white', fontWeight: '800', padding: '5px', borderRadius: '20px', marginTop: '20px' }}>NOTE:</div>
                                <p style={{ fontSize: '0.75rem', marginTop: '10px' }}>This card is property of NS Multispeciality Hospital.</p>
                            </div>
                            <div className="lab-footer-shape-back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabIdCard;
