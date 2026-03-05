import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo-white.png';
import '../../styles/Biller/BillerProfile.css';

const BillerIdCard = ({ biller, onClose }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${biller.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        }
    };

    return (
        <div className="bil-card-overlay">
            <div className="bil-card-modal">
                <div className="bil-card-actions">
                    <button onClick={handleDownload} className="bil-action-btn">📥 Download</button>
                    <button onClick={onClose} className="bil-close-btn">✖</button>
                </div>

                <div className="bil-cards-container" ref={cardRef}>
                    {/* FRONT */}
                    <div className="bil-card-wrapper">
                        <div className="bil-card bil-card-front">
                            <div className="bil-header-shape"></div>
                            <div className="bil-card-header">
                                <div className="bil-logo-stack" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={logo} alt="Logo" className="bil-logo-img" />
                                    <div className="bil-logo-text">
                                        <h3>NS MULTISPECIALITY HOSPITAL</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="bil-photo-section">
                                <div className="bil-photo-circle">
                                    {biller.profileImage ? (
                                        <img src={biller.profileImage} alt="Profile" />
                                    ) : (
                                        <div className="avatar-placeholder">{biller.name?.charAt(0)}</div>
                                    )}
                                </div>
                            </div>

                            <div className="bil-info-main">
                                <h2 className="bil-info-name">{biller.name?.toUpperCase()}</h2>
                                <div className="bil-info-role">BILLING OFFICER</div>
                            </div>

                            <div className="bil-info-grid">
                                <div className="bil-detail-row">
                                    <span className="bil-detail-label">Employee ID:</span>
                                    <span className="bil-detail-value">{biller.employeeId || `BIL-01`}</span>
                                </div>
                                <div className="bil-detail-row">
                                    <span className="bil-detail-label">Blood Group:</span>
                                    <span className="bil-detail-value">{biller.bloodGroup || "O+"}</span>
                                </div>
                                <div className="bil-detail-row">
                                    <span className="bil-detail-label">Date of Issue:</span>
                                    <span className="bil-detail-value">{new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="bil-footer-shape"></div>
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="bil-card-wrapper">
                        <div className="bil-card bil-card-back">
                            <div className="bil-back-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1a2c4e', height: '120px' }}>
                                <img src={logo} alt="Logo" style={{ height: '50px' }} />
                            </div>

                            <div className="bil-back-content" style={{ marginTop: '140px', padding: '0 30px', textAlign: 'center' }}>
                                <div className="bil-emergency-bar" style={{ fontWeight: '900', color: '#10b981', fontSize: '1.2rem' }}>EMERGENCY CONTACT:</div>
                                <p><strong>Name:</strong> {biller.emergencyContactName || "Not Set"}</p>
                                <p><strong>Phone:</strong> {biller.emergencyContactPhone || "Not Set"}</p>

                                <div className="bil-hospital-grid" style={{ marginTop: '20px', textAlign: 'left' }}>
                                    <div className="bil-h-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: '800' }}>Address:</span>
                                        <span style={{ color: '#555' }}>123, Main Road, Coimbatore</span>
                                    </div>
                                    <div className="bil-h-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: '800' }}>Phone:</span>
                                        <span style={{ color: '#555' }}>9942129724</span>
                                    </div>
                                </div>

                                <div className="bil-note-bar" style={{ background: '#10b981', color: 'white', fontWeight: '800', padding: '5px', borderRadius: '20px', marginTop: '20px' }}>NOTE:</div>
                                <p style={{ fontSize: '0.75rem', marginTop: '10px' }}>This card is property of NS Multispeciality Hospital.</p>
                            </div>
                            <div className="bil-footer-shape-back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillerIdCard;
