import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BillerLayout from "../../components/BillerLayout";
import "../../styles/Biller/BillerPatients.css";

const BillerPatients = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [patientRecords, setPatientRecords] = useState({
        prescriptions: [],
        scans: [],
        labs: [],
        reports: [],
        bills: [],
        loading: false
    });
    const [selectedDetail, setSelectedDetail] = useState(null);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [filterDate, searchQuery, patients]);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/biller/patients", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data.patients || []);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientRecords = async (patient) => {
        setSelectedPatient(patient);
        setPatientRecords(prev => ({ ...prev, loading: true }));
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [prescRes, scanRes, labRes, billRes, reportRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/biller/all-prescriptions/${patient._id}`, config).catch(() => ({ data: { prescriptions: [] } })),
                axios.get(`http://localhost:5000/api/biller/all-scan-reports/${patient._id}`, config).catch(() => ({ data: { reports: [] } })),
                axios.get(`http://localhost:5000/api/biller/all-lab-reports/${patient._id}`, config).catch(() => ({ data: { reports: [] } })),
                axios.get(`http://localhost:5000/api/biller/patient-bills/${patient._id}`, config).catch(() => ({ data: { bills: [] } })),
                axios.get(`http://localhost:5000/api/biller/all-medical-reports/${patient._id}`, config).catch(() => ({ data: { reports: [] } }))
            ]);

            setPatientRecords({
                prescriptions: prescRes.data.prescriptions || [],
                scans: scanRes.data.reports || [],
                labs: labRes.data.reports || [],
                reports: reportRes.data.reports || [],
                bills: billRes.data.bills || [],
                loading: false
            });
        } catch (error) {
            console.error("Failed to fetch records", error);
            setPatientRecords(prev => ({ ...prev, loading: false }));
        }
    };

    const handlePrintRecord = async (type, id) => {
        try {
            const token = localStorage.getItem("token");
            const url = `http://localhost:5000/api/biller/download-clinical-pdf/${type.toLowerCase()}/${id}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            window.open(pdfUrl, '_blank');
        } catch (error) {
            console.error("Print Error:", error);
            alert("Failed to generate print preview");
        }
    };

    const applyFilter = () => {
        let result = [...patients];

        if (filterDate) {
            const selectedDateStr = new Date(filterDate).toDateString();
            result = result.filter(p => new Date(p.createdAt).toDateString() === selectedDateStr);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.mrn?.toLowerCase().includes(q) ||
                p.phone?.includes(q)
            );
        }

        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredPatients(result);
    };

    const handleCreateBill = (patientId) => {
        const patient = patients.find(p => p._id === patientId);
        const doctorId = patient?.assignedDoctor?._id || patient?.assignedDoctor;
        navigate("/biller/create", { state: { patientId, doctorId } });
    };

    const ipdPatients = filteredPatients.filter(p => p.patientType === "IPD");
    const opdPatients = filteredPatients.filter(p => !p.patientType || p.patientType === "OPD");

    if (loading) return (
        <div className="compact-slate-workstation">
            <div className="compact-loader">
                <div className="micro-spinner"></div>
                <p>INITIALIZING_PATIENT_MATRIX...</p>
            </div>
        </div>
    );

    const PatientCard = ({ patient, type }) => (
        <div className="small-report-card biller-patient-node" onClick={() => fetchPatientRecords(patient)} style={{ cursor: 'pointer' }}>
            <div className={`wide-status-ribbon ${type === 'IPD' ? 'verified' : 'pending'}`}>
                {type}
            </div>

            <div className="card-technical-id">ID-{patient._id.slice(-4).toUpperCase()}</div>

            <div className="card-main-content">
                <div className="clinical-entry">
                    <span className="entry-label">PATIENT</span>
                    <span className="entry-value highlight">{patient.name.toUpperCase()}</span>
                </div>

                <div className="clinical-entry">
                    <span className="entry-label">REG_DATE</span>
                    <span className="entry-value">{new Date(patient.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="clinical-entry">
                    <span className="entry-label">MRN_IDENT</span>
                    <span className="entry-value mono">{patient.mrn || "N/A"}</span>
                </div>

                <div className="card-dashed-separator"></div>

                <div className="meta-bottom-row">
                    <div className="meta-group">
                        <span className="meta-label">CONTACT</span>
                        <span className="meta-val">{patient.phone || "STATION_OFFLINE"}</span>
                    </div>
                    <button
                        className="btn-create-bill-quartz"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCreateBill(patient._id);
                        }}
                    >
                        CREATE_BILL_→
                    </button>
                </div>
            </div>
        </div>
    );

    const RecordMatrixModal = () => (
        <div className="matrix-overlay" onClick={() => setSelectedPatient(null)}>
            <div className="matrix-modal" onClick={e => e.stopPropagation()}>
                <header className="matrix-header">
                    <div className="modal-title">
                        <span className="modal-label">CLINICAL_ACQUISITION_DOSSIER</span>
                        <h2>{selectedPatient.name.toUpperCase()}</h2>
                    </div>
                    <button className="close-matrix" onClick={() => setSelectedPatient(null)}>✕</button>
                </header>

                <div className="matrix-content">
                    {patientRecords.loading ? (
                        <div className="matrix-loader">SYNCHRONIZING_CLINICAL_DATA...</div>
                    ) : (
                        <div className="records-grid full-matrix">
                            <div className="matrix-section">
                                <div className="section-head">
                                    <span className="count-chip">{patientRecords.prescriptions.length}</span>
                                    PRESCRIPTIONS
                                </div>
                                <div className="section-body">
                                    {patientRecords.prescriptions.map((p, i) => (
                                        <div
                                            key={i}
                                            className="record-node clickable"
                                            onClick={() => setSelectedDetail({ type: 'PRESCRIPTION', data: p })}
                                        >
                                            <div className="node-head">
                                                <span className="node-date">{new Date(p.createdAt).toLocaleDateString()}</span>
                                                <div className="node-tools">
                                                    <button
                                                        className="mini-print"
                                                        onClick={(e) => { e.stopPropagation(); handlePrintRecord('prescription', p._id); }}
                                                    >🖨️</button>
                                                    <span className="node-tag pill">RX</span>
                                                </div>
                                            </div>
                                            <div className="node-desc">
                                                {p.medicines?.map(m => m.name).join(", ") || "GENERAL_ORDER"}
                                            </div>
                                        </div>
                                    ))}
                                    {patientRecords.prescriptions.length === 0 && <div className="empty-node">NO_PRESCRIPTIONS</div>}
                                </div>
                            </div>

                            <div className="matrix-section">
                                <div className="section-head">
                                    <span className="count-chip">{patientRecords.scans.length}</span>
                                    SCAN_REPORTS
                                </div>
                                <div className="section-body">
                                    {patientRecords.scans.map((s, i) => (
                                        <div
                                            key={i}
                                            className={`record-node clickable ${s.isBilled ? 'billed' : 'highlight'}`}
                                            onClick={() => setSelectedDetail({ type: 'SCAN', data: s })}
                                        >
                                            <div className="node-head">
                                                <span className="node-date">{new Date(s.createdAt).toLocaleDateString()}</span>
                                                <div className="node-tools">
                                                    <button
                                                        className="mini-print"
                                                        onClick={(e) => { e.stopPropagation(); handlePrintRecord('scan-report', s._id); }}
                                                    >🖨️</button>
                                                    <span className={`node-tag ${s.isBilled ? 'verified' : 'pending'}`}>
                                                        {s.isBilled ? 'BILLED' : 'PENDING'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="node-desc">{s.scanName}</div>
                                            <div className="node-cost">₹{s.cost}</div>
                                        </div>
                                    ))}
                                    {patientRecords.scans.length === 0 && <div className="empty-node">NO_SCAN_HISTORY</div>}
                                </div>
                            </div>

                            <div className="matrix-section">
                                <div className="section-head">
                                    <span className="count-chip">{patientRecords.labs.length}</span>
                                    LAB_REPORTS
                                </div>
                                <div className="section-body">
                                    {patientRecords.labs.map((l, i) => (
                                        <div
                                            key={i}
                                            className={`record-node clickable ${l.isBilled ? 'billed' : 'highlight'}`}
                                            onClick={() => setSelectedDetail({ type: 'LAB', data: l })}
                                        >
                                            <div className="node-head">
                                                <span className="node-date">{new Date(l.createdAt).toLocaleDateString()}</span>
                                                <div className="node-tools">
                                                    <button
                                                        className="mini-print"
                                                        onClick={(e) => { e.stopPropagation(); handlePrintRecord('lab-report', l._id); }}
                                                    >🖨️</button>
                                                    <span className={`node-tag ${l.isBilled ? 'verified' : 'pending'}`}>
                                                        {l.isBilled ? 'BILLED' : 'PENDING'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="node-desc">{l.testName}</div>
                                            <div className="node-cost">₹{l.cost}</div>
                                        </div>
                                    ))}
                                    {patientRecords.labs.length === 0 && <div className="empty-node">NO_LAB_HISTORY</div>}
                                </div>
                            </div>

                            <div className="matrix-section">
                                <div className="section-head">
                                    <span className="count-chip">{patientRecords.reports.length}</span>
                                    MEDICAL_REPORTS
                                </div>
                                <div className="section-body">
                                    {patientRecords.reports.map((r, i) => (
                                        <div
                                            key={i}
                                            className="record-node clinical clickable"
                                            onClick={() => setSelectedDetail({ type: 'REPORT', data: r })}
                                        >
                                            <div className="node-head">
                                                <span className="node-date">{new Date(r.date).toLocaleDateString()}</span>
                                                <div className="node-tools">
                                                    <button
                                                        className="mini-print"
                                                        onClick={(e) => { e.stopPropagation(); handlePrintRecord('report', r._id); }}
                                                    >🖨️</button>
                                                    <span className="node-tag pill">CLINICAL</span>
                                                </div>
                                            </div>
                                            <div className="node-desc">{r.reportTitle}</div>
                                            <div className="node-meta-small">Dr. {r.doctor?.name} | {r.diagnosis || 'General Observation'}</div>
                                        </div>
                                    ))}
                                    {patientRecords.reports.length === 0 && <div className="empty-node">NO_MEDICAL_REPORTS</div>}
                                </div>
                            </div>

                            <div className="matrix-section">
                                <div className="section-head">
                                    <span className="count-chip">{patientRecords.bills.length}</span>
                                    BILLING_HISTORY
                                </div>
                                <div className="section-body">
                                    {patientRecords.bills.map((b, i) => (
                                        <div
                                            key={i}
                                            className="record-node financial clickable"
                                            onClick={() => setSelectedDetail({ type: 'BILL', data: b })}
                                        >
                                            <div className="node-head">
                                                <span className="node-date">{new Date(b.createdAt).toLocaleDateString()}</span>
                                                <div className="node-tools">
                                                    <button
                                                        className="mini-print"
                                                        onClick={(e) => { e.stopPropagation(); handlePrintRecord('bill', b._id); }}
                                                    >🖨️</button>
                                                    <span className="node-tag dark">₹{b.amount}</span>
                                                </div>
                                            </div>
                                            <div className="node-desc">{b.treatment}</div>
                                            <div className="node-meta-small">Dr. {b.doctor?.name} | {b.paymentMode}</div>
                                        </div>
                                    ))}
                                    {patientRecords.bills.length === 0 && <div className="empty-node">NO_BILLING_HISTORY</div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedDetail && (
                        <div className="detail-expansion-panel">
                            <header className="detail-panel-header">
                                <div className="detail-title">
                                    <span className="detail-label">{selectedDetail.type}_ACQUISITION</span>
                                    <h3>RECORD_SPECIFICATIONS</h3>
                                </div>
                                <div className="detail-panel-actions">
                                    <button
                                        className="print-action-btn"
                                        onClick={() => handlePrintRecord(selectedDetail.type, selectedDetail.data._id)}
                                    >
                                        PRINT_RECORD 🖨️
                                    </button>
                                    <button className="close-detail" onClick={() => setSelectedDetail(null)}>✕</button>
                                </div>
                            </header>

                            <div className="detail-panel-scroll">
                                {selectedDetail.type === 'PRESCRIPTION' && (
                                    <div className="rx-deep-detail">
                                        <div className="detail-entry-group">
                                            <span className="group-label">PHARMACEUTICAL_INVENTORY</span>
                                            {selectedDetail.data.medicines?.map((m, idx) => (
                                                <div key={idx} className="med-detail-node">
                                                    <div className="med-head">
                                                        <span className="med-name">{m.name.toUpperCase()}</span>
                                                        <span className="med-qty">{m.duration}</span>
                                                    </div>
                                                    <div className="med-sig">
                                                        <span>{m.dosage}</span>
                                                        <span className="sig-sep">|</span>
                                                        <span>{m.frequency}</span>
                                                        {m.mealInstruction && (
                                                            <>
                                                                <span className="sig-sep">|</span>
                                                                <span className="meal-tag">{m.mealInstruction}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedDetail.data.notes && (
                                            <div className="detail-entry-group">
                                                <span className="group-label">CLINICAL_ANNOTATIONS</span>
                                                <div className="notes-box">{selectedDetail.data.notes}</div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedDetail.type === 'BILL' && (
                                    <div className="bill-deep-detail">
                                        <div className="detail-entry-group">
                                            <span className="group-label">FINANCIAL_LINE_ITEMS</span>
                                            <div className="bill-table">
                                                <div className="table-head">
                                                    <span>ITEM</span>
                                                    <span>QTY</span>
                                                    <span>PRICE</span>
                                                </div>
                                                {selectedDetail.data.billItems?.map((item, idx) => (
                                                    <div key={idx} className="table-row">
                                                        <span className="item-name">{item.name}</span>
                                                        <span className="item-qty">{item.qty}</span>
                                                        <span className="item-price">₹{item.charge}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="financial-summary">
                                            <div className="summary-row">
                                                <span>SUB_TOTAL</span>
                                                <span>₹{selectedDetail.data.amount}</span>
                                            </div>
                                            <div className="summary-row highlight">
                                                <span>GRAND_TOTAL</span>
                                                <span>₹{selectedDetail.data.amount}</span>
                                            </div>
                                        </div>
                                        <div className="financial-meta">
                                            <div className="meta-bit">
                                                <span className="m-label">PAYMENT_MODE</span>
                                                <span className="m-val">{selectedDetail.data.paymentMode.toUpperCase()}</span>
                                            </div>
                                            <div className="meta-bit">
                                                <span className="m-label">STATUS</span>
                                                <span className="m-val verified">{selectedDetail.data.paid ? 'SETTLED' : 'PENDING'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDetail.type === 'REPORT' && (
                                    <div className="report-deep-detail">
                                        <div className="detail-entry-group">
                                            <span className="group-label">CLINICAL_SUMMARY</span>
                                            <div className="findings-box">
                                                <strong>{selectedDetail.data.reportTitle}</strong>
                                                <p>{selectedDetail.data.reportDetails}</p>
                                            </div>
                                        </div>
                                        <div className="detail-entry-group">
                                            <span className="group-label">DIAGNOSIS</span>
                                            <div className="diagnosis-node">{selectedDetail.data.diagnosis || 'NO_DECLARED_DIAGNOSIS'}</div>
                                        </div>
                                    </div>
                                )}

                                {selectedDetail.type === 'SCAN' && (
                                    <div className="scan-deep-detail">
                                        <div className="detail-entry-group">
                                            <span className="group-label">IMAGING_SPECIFICATIONS</span>
                                            <div className="imaging-node">
                                                <strong>{selectedDetail.data.scanName}</strong>
                                                <p>{selectedDetail.data.description}</p>
                                            </div>
                                        </div>
                                        <div className="financial-summary">
                                            <div className="summary-row">
                                                <span>PROCEDURE_COST</span>
                                                <span>₹{selectedDetail.data.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedDetail.type === 'LAB' && (
                                    <div className="lab-deep-detail">
                                        <div className="detail-entry-group">
                                            <span className="group-label">LABORATORY_SPECIFICATIONS</span>
                                            <div className="imaging-node">
                                                <strong>{selectedDetail.data.testName}</strong>
                                                <p>{selectedDetail.data.testType}</p>
                                            </div>
                                        </div>
                                        <div className="financial-summary">
                                            <div className="summary-row">
                                                <span>TEST_COST</span>
                                                <span>₹{selectedDetail.data.cost}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <footer className="matrix-footer">
                    <div className="footer-telemetry">
                        <span className="t-label">MRN:</span>
                        <span className="t-val">{selectedPatient.mrn}</span>
                        <span className="t-sep">|</span>
                        <span className="t-label">PHONE:</span>
                        <span className="t-val">{selectedPatient.phone}</span>
                    </div>
                    <button className="btn-matrix-bill" onClick={() => handleCreateBill(selectedPatient._id)}>
                        OPEN_BILLING_CONSOLE_→
                    </button>
                </footer>
            </div>
        </div>
    );

    return (
        <BillerLayout>
            <div className="compact-slate-workstation">
                <header className="compact-sticky-header">
                    <div className="header-identity">
                        <div className="header-title-box">
                            <span className="super-label">DEPARTMENT_BILLING_ARCHIVE</span>
                            <h1>BILLING_MATRIX_DIRECTORY</h1>
                        </div>
                        <div className="live-telemetry">
                            <div className="telemetry-item">
                                <span className="tel-label">SYSTEM_LOAD</span>
                                <span className="tel-val">NOMINAL</span>
                            </div>
                            <div className="telemetry-item">
                                <span className="tel-label">TOTAL_RECORDS</span>
                                <span className="tel-val mono">{filteredPatients.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="header-controls">
                        <div className="search-capsule">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="SEARCH_BY_NAME_OR_MRN..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-capsule">
                            <span className="filter-label">DATE_STAMP:</span>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="compact-grid-scroller">
                    <div className="billing-split-grid">
                        {/* OPD COLUMN */}
                        <div className="biller-column-zone">
                            <div className="column-zone-header opd">
                                <span className="zone-tag">OUTPATIENT_STREAM_OPD</span>
                                <span className="zone-count">COUNT_{opdPatients.length}</span>
                            </div>
                            <div className="compact-reports-grid">
                                {opdPatients.map((p, index) => (
                                    <PatientCard key={p._id} patient={p} type="OPD" style={{ animationDelay: `${index * 0.05}s` }} />
                                ))}
                                {opdPatients.length === 0 && (
                                    <div className="compact-empty-state">NO_OPD_RECORDS_AVAILABLE</div>
                                )}
                            </div>
                        </div>

                        {/* IPD COLUMN */}
                        <div className="biller-column-zone">
                            <div className="column-zone-header ipd">
                                <span className="zone-tag">INPATIENT_STREAM_IPD</span>
                                <span className="zone-count">COUNT_{ipdPatients.length}</span>
                            </div>
                            <div className="compact-reports-grid">
                                {ipdPatients.map((p, index) => (
                                    <PatientCard key={p._id} patient={p} type="IPD" style={{ animationDelay: `${index * 0.05}s` }} />
                                ))}
                                {ipdPatients.length === 0 && (
                                    <div className="compact-empty-state">NO_IPD_RECORDS_AVAILABLE</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {selectedPatient && <RecordMatrixModal />}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');

                .compact-slate-workstation {
                    background: #ffffff;
                    height: 100%;
                    font-family: 'JetBrains Mono', monospace;
                    color: #0f172a;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .matrix-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(8px);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .matrix-modal {
                    background: #ffffff;
                    border: 2px solid #0f172a;
                    width: 100%;
                    max-width: 1300px;
                    max-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 20px 20px 0px rgba(15, 23, 42, 0.1);
                    animation: modalEntry 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes modalEntry {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                .matrix-header {
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid #0f172a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                }

                .modal-label { font-size: 0.6rem; color: #94a3b8; font-weight: 800; letter-spacing: 0.2em; display: block; margin-bottom: 0.25rem; }
                .modal-title h2 { margin: 0; font-size: 1.5rem; font-weight: 900; }

                .close-matrix {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: #94a3b8;
                    transition: color 0.2s;
                }
                .close-matrix:hover { color: #0f172a; }

                .matrix-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 2rem;
                }

                .matrix-loader {
                    padding: 4rem;
                    text-align: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    letter-spacing: 0.1em;
                }

                .records-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .records-grid.full-matrix {
                    grid-template-columns: repeat(5, 1fr);
                    gap: 1.25rem;
                }

                .matrix-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .section-head {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.7rem;
                    font-weight: 900;
                    color: #1e293b;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 0.5rem;
                }

                .count-chip {
                    background: #0f172a;
                    color: white;
                    padding: 0.1rem 0.4rem;
                    font-size: 0.6rem;
                    border-radius: 2px;
                }

                .section-body { display: flex; flex-direction: column; gap: 0.75rem; }

                .record-node {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 1rem;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .record-node.clickable {
                    cursor: pointer;
                }
                .record-node.clickable:hover {
                    border-color: #0f172a;
                    background: #ffffff;
                    transform: scale(1.02);
                    box-shadow: 4px 4px 0px rgba(15, 23, 42, 0.05);
                    z-index: 10;
                }

                .record-node.highlight {
                    border-left: 3px solid #0f172a;
                }

                .record-node.billed {
                    opacity: 0.7;
                    border-left: 3px solid #94a3b8;
                    background: #f1f5f9;
                }

                .record-node.financial {
                    border-left: 3px solid #10b981;
                    background: #f0fdf4;
                }

                .record-node.clinical {
                    border-left: 3px solid #6366f1;
                    background: #eef2ff;
                }

                .node-head { display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center; }
                .node-date { font-size: 0.55rem; color: #94a3b8; font-weight: 700; }
                
                .node-tag { 
                    font-size: 0.5rem; 
                    font-weight: 900; 
                    background: #e2e8f0; 
                    padding: 0.1rem 0.3rem; 
                    letter-spacing: 0.05em;
                }

                .node-tag.verified { background: #dcfce7; color: #166534; }
                .node-tag.pending { background: #fee2e2; color: #991b1b; }
                .node-tag.pill { border-radius: 10px; background: #0f172a; color: white; }
                .node-tag.dark { background: #0f172a; color: white; }

                .node-desc { font-size: 0.7rem; font-weight: 700; color: #1e293b; line-height: 1.4; }
                .node-cost { font-size: 0.75rem; font-weight: 900; color: #0f172a; margin-top: 0.5rem; }
                
                .node-meta-small {
                    font-size: 0.55rem;
                    color: #64748b;
                    font-weight: 600;
                    margin-top: 0.4rem;
                }

                .empty-node {
                    font-size: 0.6rem;
                    color: #cbd5e1;
                    font-weight: 700;
                    padding: 2rem 0;
                    text-align: center;
                    border: 1px dashed #e2e8f0;
                }

                .matrix-footer {
                    padding: 1rem 2rem;
                    border-top: 2px solid #0f172a;
                    background: #f8fafc;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    z-index: 200;
                }

                .node-tools {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .mini-print {
                    background: transparent;
                    border: none;
                    font-size: 0.8rem;
                    cursor: pointer;
                    opacity: 0.4;
                    transition: all 0.2s;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .record-node:hover .mini-print {
                    opacity: 1;
                    transform: scale(1.2);
                }

                .detail-panel-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .print-action-btn {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 0.4rem 0.8rem;
                    font-size: 0.65rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    transition: background 0.2s;
                }
                .print-action-btn:hover {
                    background: #059669;
                }

                /* DETAIL PANEL STYLES */
                .detail-expansion-panel {
                    position: absolute;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    width: 400px;
                    background: #ffffff;
                    border-left: 2px solid #0f172a;
                    z-index: 500;
                    display: flex;
                    flex-direction: column;
                    animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: -10px 0 30px rgba(0,0,0,0.1);
                }

                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .detail-panel-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #0f172a;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    background: #f8fafc;
                }

                .detail-label { font-size: 0.55rem; color: #94a3b8; font-weight: 800; letter-spacing: 0.2em; display: block; margin-bottom: 0.25rem; }
                .detail-panel-header h3 { margin: 0; font-size: 1rem; font-weight: 900; }

                .close-detail {
                    background: #0f172a;
                    color: white;
                    border: none;
                    width: 24px;
                    height: 24px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .detail-panel-scroll {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .detail-entry-group {
                    margin-bottom: 2rem;
                }

                .group-label {
                    display: block;
                    font-size: 0.55rem;
                    font-weight: 900;
                    color: #94a3b8;
                    margin-bottom: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 0.25rem;
                }

                /* RX DETAIL */
                .med-detail-node {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 1rem;
                    margin-bottom: 0.75rem;
                }
                .med-head { display: flex; justify-content: space-between; margin-bottom: 0.4rem; }
                .med-name { font-size: 0.75rem; font-weight: 900; color: #0f172a; }
                .med-qty { font-size: 0.6rem; color: #64748b; font-weight: 700; }
                .med-sig { font-size: 0.65rem; color: #1e293b; font-weight: 600; display: flex; gap: 0.5rem; }
                .sig-sep { color: #cbd5e1; }
                .meal-tag { color: #6366f1; font-weight: 800; }

                .notes-box {
                    font-size: 0.7rem;
                    line-height: 1.6;
                    color: #475569;
                    background: #fffbef;
                    border-left: 3px solid #f59e0b;
                    padding: 1rem;
                }

                /* BILL DETAIL */
                .bill-table { display: flex; flex-direction: column; }
                .table-head {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr;
                    font-size: 0.55rem;
                    font-weight: 900;
                    color: #94a3b8;
                    padding: 0.5rem;
                    background: #f1f5f9;
                }
                .table-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1.5fr;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 0.75rem 0.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .item-price { text-align: right; }

                .financial-summary {
                    background: #0f172a;
                    color: white;
                    padding: 1.5rem;
                    margin-top: 1rem;
                }
                .summary-row { display: flex; justify-content: space-between; font-size: 0.6rem; margin-bottom: 0.5rem; opacity: 0.7; }
                .summary-row.highlight { font-size: 1rem; font-weight: 900; opacity: 1; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; }

                .financial-meta {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                .m-label { font-size: 0.5rem; color: #94a3b8; font-weight: 800; display: block; }
                .m-val { font-size: 0.7rem; font-weight: 900; color: #0f172a; }
                .m-val.verified { color: #10b981; }

                /* REPORT DETAIL */
                .findings-box {
                    background: #f0fdf4;
                    border: 1px solid #dcfce7;
                    padding: 1rem;
                }
                .findings-box strong { display: block; font-size: 0.75rem; margin-bottom: 0.5rem; }
                .findings-box p { font-size: 0.7rem; margin: 0; line-height: 1.5; color: #166534; }
                .diagnosis-node {
                    background: #0f172a;
                    color: white;
                    padding: 1rem;
                    font-size: 0.8rem;
                    font-weight: 900;
                }

                /* SCAN/LAB DETAIL */
                .imaging-node {
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    padding: 1rem;
                }
                .imaging-node strong { display: block; font-size: 0.75rem; margin-bottom: 0.5rem; }
                .imaging-node p { font-size: 0.7rem; margin: 0; color: #1e40af; }

                .footer-telemetry { display: flex; gap: 1rem; align-items: center; }
                .t-label { font-size: 0.6rem; font-weight: 800; color: #94a3b8; }
                .t-val { font-size: 0.7rem; font-weight: 900; color: #0f172a; }
                .t-sep { color: #e2e8f0; font-size: 0.8rem; }

                .btn-matrix-bill {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 0.6rem 1.2rem;
                    font-family: inherit;
                    font-size: 0.65rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-matrix-bill:hover { background: #1e293b; letter-spacing: 0.05em; }

                .compact-sticky-header {
                    position: sticky;
                    top: 0;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(12px);
                    z-index: 100;
                    padding: 1rem 2rem;
                    border-bottom: 2px solid #0f172a;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .header-identity { display: flex; flex-direction: column; gap: 0.75rem; }
                .super-label { font-size: 0.55rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.2em; display: block; }
                .header-title-box h1 { margin: 0; font-size: 1.25rem; font-weight: 900; letter-spacing: -0.02em; line-height: 1; }

                .live-telemetry { display: flex; gap: 2rem; border-top: 1px solid #f1f5f9; padding-top: 0.5rem; }
                .telemetry-item { display: flex; flex-direction: column; }
                .tel-label { font-size: 0.5rem; color: #94a3b8; font-weight: 700; margin-bottom: 0.1rem; }
                .tel-val { font-size: 0.7rem; font-weight: 900; color: #0f172a; }

                .header-controls { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.25rem; }
                .search-capsule, .filter-capsule {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.4rem 0.8rem;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    height: 32px;
                }
                .search-icon { font-size: 0.8rem; opacity: 0.5; }
                .search-capsule input, .filter-capsule input {
                    background: none;
                    border: none;
                    outline: none;
                    font-family: inherit;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #1e293b;
                    width: 180px;
                }
                .filter-label { font-size: 0.6rem; font-weight: 800; color: #94a3b8; }

                .compact-grid-scroller { 
                    flex: 1; 
                    padding: 2rem; 
                    overflow-y: auto; 
                }

                .billing-split-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                }

                .column-zone-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.4rem 0;
                    border-bottom: 2px solid #0f172a;
                    margin-bottom: 1rem;
                }
                .zone-tag { font-size: 0.65rem; font-weight: 900; }
                .zone-count { font-size: 0.55rem; color: #64748b; font-weight: 700; }

                .compact-reports-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 1rem;
                }

                .small-report-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    animation: slideUpFade 0.5s ease-out forwards;
                    opacity: 0;
                }

                @keyframes slideUpFade {
                    from { transform: translateY(5px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .small-report-card:hover {
                    border-color: #0f172a;
                    box-shadow: 2px 2px 0px #0f172a;
                    transform: translate(-1px, -1px);
                }

                .wide-status-ribbon {
                    height: 3px;
                    width: 25%;
                    margin: 1.2rem 0 0 1.2rem;
                }
                .wide-status-ribbon.verified { background: #22c55e; }
                .wide-status-ribbon.pending { background: #6366f1; }

                .card-technical-id {
                    position: absolute;
                    top: 1.2rem;
                    right: 1.2rem;
                    font-size: 0.55rem;
                    font-weight: 800;
                    color: #94a3b8;
                }

                .card-main-content { padding: 1.2rem; }
                .clinical-entry { display: flex; justify-content: space-between; margin-bottom: 0.3rem; }
                .entry-label { font-size: 0.6rem; color: #94a3b8; font-weight: 700; width: 30%; }
                .entry-value { font-size: 0.7rem; font-weight: 800; color: #1e293b; width: 65%; text-align: right; }
                .entry-value.highlight { color: #0f172a; font-size: 0.75rem; }

                .card-dashed-separator {
                    border-top: 1px dashed #e2e8f0;
                    margin: 0.75rem 0;
                }

                .meta-bottom-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .meta-label { font-size: 0.5rem; color: #94a3b8; font-weight: 700; display: block; }
                .meta-val { font-size: 0.6rem; font-weight: 700; color: #1e293b; }

                .btn-create-bill-quartz {
                    background: #0f172a;
                    color: white;
                    border: none;
                    padding: 0.3rem 0.6rem;
                    font-family: inherit;
                    font-size: 0.55rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-create-bill-quartz:hover { background: #1e293b; letter-spacing: 0.05em; }

                .compact-empty-state {
                    grid-column: 1 / -1;
                    padding: 4rem;
                    text-align: center;
                    color: #cbd5e1;
                    font-weight: 700;
                    font-size: 0.7rem;
                    border: 1px dashed #e2e8f0;
                }

                @media (max-width: 1200px) {
                    .billing-split-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </BillerLayout>
    );
};

export default BillerPatients;
