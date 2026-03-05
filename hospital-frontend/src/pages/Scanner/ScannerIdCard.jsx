import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import logo from '../../assets/logo-white.png';
import '../../styles/Scanner/ScannerProfile.css';

const ScannerIdCard = ({ scanner, onClose }) => {
    const cardRef = useRef(null);

    const handleDownload = async () => {
        if (cardRef.current) {
            const canvas = await html2canvas(cardRef.current);
            const dataUrl = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${scanner.name.replace(/\s+/g, '_')}_ID_Card.png`;
            link.click();
        }
    };

    return (
        <div className="scn-card-overlay">
            <div className="scn-card-modal">
                <div className="scn-card-actions">
                    <button onClick={handleDownload} className="scn-action-btn">📥 Download</button>
                    <button onClick={onClose} className="scn-close-btn">✖</button>
                </div>

                <div className="scn-cards-container" ref={cardRef}>
                    {/* FRONT */}
                    <div className="scn-card-wrapper">
                        <div className="scn-card scn-card-front">
                            <div className="scn-header-shape"></div>
                            <div className="scn-card-header">
                                <div className="scn-logo-stack" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img src={logo} alt="Logo" className="scn-logo-img" />
                                    <div className="scn-logo-text">
                                        <h3>NS MULTISPECIALITY HOSPITAL</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="scn-photo-section">
                                <div className="scn-photo-circle">
                                    {scanner.profileImage ? (
                                        <img src={scanner.profileImage} alt="Profile" />
                                    ) : (
                                        <div className="avatar-placeholder">{scanner.name?.charAt(0)}</div>
                                    )}
                                </div>
                            </div>

                            <div className="scn-info-main">
                                <h2 className="scn-info-name">{scanner.name?.toUpperCase()}</h2>
                                <div className="scn-info-role">SCANNER TECHNICIAN</div>
                            </div>

                            <div className="scn-info-grid">
                                <div className="scn-detail-row">
                                    <span className="scn-detail-label">Employee ID:</span>
                                    <span className="scn-detail-value">{scanner.employeeId || `SCN-01`}</span>
                                </div>
                                <div className="scn-detail-row">
                                    <span className="scn-detail-label">Blood Group:</span>
                                    <span className="scn-detail-value">{scanner.bloodGroup || "O+"}</span>
                                </div>
                                <div className="scn-detail-row">
                                    <span className="scn-detail-label">Date of Issue:</span>
                                    <span className="scn-detail-value">{new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</span>
                                </div>
                            </div>
                            <div className="scn-footer-shape"></div>
                        </div>
                    </div>

                    {/* BACK */}
                    <div className="scn-card-wrapper">
                        <div className="scn-card scn-card-back">
                            <div className="scn-back-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#1a2c4e', height: '120px' }}>
                                <img src={logo} alt="Logo" style={{ height: '50px' }} />
                            </div>

                            <div className="scn-back-content" style={{ marginTop: '140px', padding: '0 30px', textAlign: 'center' }}>
                                <div className="scn-emergency-bar" style={{ fontWeight: '900', color: '#8b5cf6', fontSize: '1.2rem' }}>EMERGENCY CONTACT:</div>
                                <p><strong>Name:</strong> {scanner.emergencyContactName || "Not Set"}</p>
                                <p><strong>Phone:</strong> {scanner.emergencyContactPhone || "Not Set"}</p>

                                <div className="scn-hospital-grid" style={{ marginTop: '20px', textAlign: 'left' }}>
                                    <div className="scn-h-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: '800' }}>Address:</span>
                                        <span style={{ color: '#555' }}>123, Main Road, Coimbatore</span>
                                    </div>
                                    <div className="scn-h-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ fontWeight: '800' }}>Phone:</span>
                                        <span style={{ color: '#555' }}>9942129724</span>
                                    </div>
                                </div>

                                <div className="scn-note-bar" style={{ background: '#8b5cf6', color: 'white', fontWeight: '800', padding: '5px', borderRadius: '20px', marginTop: '20px' }}>NOTE:</div>
                                <p style={{ fontSize: '0.75rem', marginTop: '10px' }}>This card is property of NS Multispeciality Hospital.</p>
                            </div>
                            <div className="scn-footer-shape-back"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerIdCard;
