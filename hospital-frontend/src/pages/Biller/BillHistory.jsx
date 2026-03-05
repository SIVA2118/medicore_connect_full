import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Biller/BillHistory.css";
import BillModal from "../../components/BillModal";

const BillHistory = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);
    const [autoPrint, setAutoPrint] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/biller/all-bills", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBills(res.data.bills || []);
        } catch (error) {
            console.error("Failed to fetch bill history", error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (bill) => {
        setSelectedBill(bill);
        setAutoPrint(false);
    };

    const handlePrint = (bill) => {
        setSelectedBill(bill);
        setAutoPrint(true);
    };

    const handleGeneratePDF = async (bill) => {
        const token = localStorage.getItem("token");

        try {
            // 1. Download PDF (Desktop Backup)
            const pdfRes = await axios.post("http://localhost:5000/api/biller/generate-pdf",
                { billId: bill._id },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([pdfRes.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Bill-${bill._id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("PDF Download failed", error);
            // Continue to WhatsApp attempt
        }

        try {
            // 2. Open WhatsApp Window (Client View)
            if (bill.patient?.phone) {
                const rawPhone = bill.patient.phone.replace(/\D/g, "");
                const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

                const pdfLink = `http://localhost:5000/api/biller/view-pdf/${bill._id}`;

                const message = encodeURIComponent(
                    `Hello ${bill.patient.name}, here is your bill for treatment "${bill.treatment}".\n\n📄 View PDF: ${pdfLink}\n\nFor queries, contact 9942129724.`
                );

                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            }

            // 3. Auto-Send via Server (The "Auto Attach" Logic)
            await axios.post("http://localhost:5000/api/biller/send-whatsapp",
                { billId: bill._id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Alert for successful server send + instructions for manual send
            alert(`✅ System sent the bill automatically via API!\n\n⚠️ BROWSER LIMITATION: Files cannot be auto-attached to the WhatsApp window we opened.\n\n👉 HANDS ON: To send it personally, please DRAG & DROP the downloaded PDF into the chat.`);

        } catch (error) {
            console.error("Server Send failed", error);
            // Alert if server failed, emphasizing manual step
            alert(`⚠️ Automatic Send Failed.\n\n👉 ACTION REQUIRED: WhatsApp Window is open. Please DRAG & DROP the downloaded file into the chat to send it manually.`);
        }
    };

    const handleSendWhatsApp = (bill) => {
        if (bill.patient?.phone) {
            const rawPhone = bill.patient.phone.replace(/\D/g, "");
            const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

            const message = encodeURIComponent(
                `Hello ${bill.patient.name}, here is your bill for treatment "${bill.treatment}".\n\nFor queries, contact 9942129724.`
            );

            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        } else {
            alert("Patient has no phone number.");
        }
    };

    const filteredBills = bills.filter(bill => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            bill._id.toLowerCase().includes(searchLower) ||
            (bill.patient?.name || "").toLowerCase().includes(searchLower) ||
            (bill.patientName || "").toLowerCase().includes(searchLower) ||
            (bill.patient?.mrn || "").toLowerCase().includes(searchLower);

        const matchesDate = filterDate
            ? new Date(bill.createdAt).toDateString() === new Date(filterDate).toDateString()
            : true;

        return matchesSearch && matchesDate;
    });

    const totalCollection = filteredBills.reduce((acc, bill) => acc + bill.amount, 0);

    const formatDoctorName = (name) => {
        if (!name) return "N/A";
        const cleanName = name.toUpperCase();
        return cleanName.startsWith("DR.") || cleanName.startsWith("DR ") ? cleanName : `DR. ${cleanName}`;
    };

    if (loading) return (
        <div className="compact-slate-workstation">
            <div className="compact-loader">
                <div className="micro-spinner"></div>
                <p>INITIALIZING_HISTORY_MATRIX...</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="compact-slate-workstation">
                <header className="compact-sticky-header">
                    <div className="header-content-inner">
                        <div className="header-left-group">
                            <div className="header-branding">
                                <span className="dept-tag">DEPT_BILLING_FINANCE</span>
                                <div className="main-title-row">
                                    <h1>BILL_HISTORY_RETRIEVAL</h1>
                                    <div className="header-status-node">
                                        <span className="pulse-dot"></span>
                                        SYS_RECORD_SYNC_ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="clinical-telemetry">
                            <div className="telemetry-node">
                                <span className="t-label">TOTAL_INVOICES</span>
                                <span className="t-val">{bills.length}</span>
                            </div>
                            <div className="telemetry-node highlight">
                                <span className="t-label">TOTAL_COLLECTION</span>
                                <span className="t-val">₹{totalCollection.toLocaleString()}</span>
                            </div>
                            <div className="telemetry-node">
                                <span className="t-label">CURRENCY</span>
                                <span className="t-val">INR</span>
                            </div>
                        </div>

                        <div className="technical-controls">
                            <div className="search-composite">
                                <div className="search-icon-node">SEARCH_ID</div>
                                <input
                                    type="text"
                                    className="mono-input"
                                    placeholder="RESOLVE_INVOICE_ID_OR_MRN..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <input
                                type="date"
                                className="mono-date-input"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                <div className="compact-grid-scroller">
                    <div className="technical-data-grid">
                        <div className="grid-head">
                            <div className="g-col">DATE_STAMP</div>
                            <div className="g-col">INVOICE_IDENT</div>
                            <div className="g-col">MRN_IDENT</div>
                            <div className="g-col">PATIENT_NAME</div>
                            <div className="g-col">ATTENDING_DOCTOR</div>
                            <div className="g-col">MODE</div>
                            <div className="g-col">AMOUNT</div>
                            <div className="g-col">STATUS</div>
                            <div className="g-col text-right">ACTION_RIBBON</div>
                        </div>

                        <div className="grid-body">
                            {filteredBills.map((bill, index) => (
                                <div key={bill._id} className="grid-row" style={{ animationDelay: `${index * 0.03}s` }}>
                                    <div className="g-cell date-stamp">{new Date(bill.createdAt).toLocaleDateString("en-IN")}</div>
                                    <div className="g-cell mono">#{bill._id.slice(-6).toUpperCase()}</div>
                                    <div className="g-cell mono highlight">{bill.patient?.mrn || (bill.isWod ? "WALK-IN" : "N/A")}</div>
                                    <div className="g-cell patient-name">{(bill.patient?.name || bill.patientName || "UNKNOWN").toUpperCase()}</div>
                                    <div className="g-cell doctor-name">{bill.isWod ? "WOD (NO DOCTOR)" : formatDoctorName(bill.doctor?.name)}</div>
                                    <div className="g-cell">
                                        <span className={`type-tag ${bill.patient?.patientType === 'IPD' ? 'ipd' : 'opd'}`}>
                                            {bill.patient?.patientType || "OPD"}
                                        </span>
                                    </div>
                                    <div className="g-cell amount-val">₹{bill.amount.toLocaleString()}</div>
                                    <div className="g-cell">
                                        <span className={`status-pill ${bill.paid ? 'verified' : 'pending'}`}>
                                            {bill.paid ? "SETTLED" : "UNPAID"}
                                        </span>
                                    </div>
                                    <div className="g-cell text-right">
                                        <div className="action-ribbon-compact">
                                            <button onClick={() => handleView(bill)} className="ribbon-btn" title="VIEW_INVOICE">👁</button>
                                            <button onClick={() => handlePrint(bill)} className="ribbon-btn" title="PRINT_HARDCOPY">🖨</button>
                                            <button onClick={() => handleGeneratePDF(bill)} className="ribbon-btn" title="DOWNLOAD_RAW_PDF">⬇</button>
                                            <button onClick={() => handleSendWhatsApp(bill)} className="ribbon-btn whatsapp" title="SEND_TO_MOBILE">📱</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredBills.length === 0 && (
                                <div className="grid-empty-state">
                                    <span className="empty-label">ZERO_RESULTS_IN_MATRIX_SYNC</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {selectedBill && (
                    <BillModal
                        bill={selectedBill}
                        autoPrint={autoPrint}
                        onClose={() => setSelectedBill(null)}
                    />
                )}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

                .compact-slate-workstation {
                    background: #fdfdfe;
                    height: 100%;
                    overflow: hidden;
                    font-family: 'Outfit', sans-serif;
                    color: #0f172a;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                    width: 100%;
                }

                .compact-sticky-header {
                    height: 72px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(24px) saturate(200%);
                    -webkit-backdrop-filter: blur(24px) saturate(200%);
                    z-index: 1000;
                    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
                    flex-shrink: 0;
                }

                .header-content-inner {
                    width: 100%;
                    padding: 0 2rem;
                    height: 100%;
                    display: grid;
                    grid-template-columns: 1.2fr 1.4fr 1.2fr;
                    align-items: center;
                }

                /* --- BRANDING & TELEMETRY --- */
                .header-left-group { display: flex; align-items: center; gap: 1.5rem; }
                .dept-tag { 
                    font-size: 0.55rem; 
                    font-weight: 800; 
                    color: #64748b; 
                    letter-spacing: 0.3em; 
                    display: block; 
                    margin-bottom: 0.2rem; 
                    text-transform: uppercase; 
                    opacity: 0.8; 
                }
                .main-title-row { display: flex; align-items: center; gap: 1rem; }
                .main-title-row h1 { 
                    margin: 0; 
                    font-size: 1.15rem; 
                    font-weight: 950; 
                    letter-spacing: -0.03em; 
                    color: #0f172a; 
                    background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-status-node {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.55rem;
                    font-weight: 900;
                    color: #059669;
                    background: rgba(16, 185, 129, 0.06);
                    padding: 0.25rem 0.75rem;
                    border: 1px solid rgba(16, 185, 129, 0.12);
                    border-radius: 4px;
                }

                .pulse-dot { 
                    width: 6px; 
                    height: 6px; 
                    background: #10b981; 
                    border-radius: 50%; 
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); 
                    animation: ultraPulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); 
                }
                @keyframes ultraPulse { 
                    0% { opacity: 1; transform: scale(1); } 
                    50% { opacity: 0.3; transform: scale(0.85); } 
                    100% { opacity: 1; transform: scale(1); } 
                }

                .clinical-telemetry { display: flex; gap: 2.5rem; align-items: center; justify-content: center; }
                .telemetry-node { display: flex; flex-direction: column; align-items: center; text-align: center; }
                .t-label { font-size: 0.5rem; font-weight: 900; color: #94a3b8; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.3rem; }
                .t-val { font-size: 1.1rem; font-weight: 950; color: #0f172a; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em; }
                
                .telemetry-node.highlight .t-val { 
                    padding: 0 0.15rem;
                    border-bottom: 2px solid #0f172a;
                    line-height: 1.1;
                }

                /* --- CONTROLS --- */
                .technical-controls { display: flex; gap: 1rem; align-items: center; justify-content: flex-end; }
                .search-composite { 
                    display: flex; 
                    align-items: center; 
                    background: rgba(241, 245, 249, 0.7); 
                    border: 1px solid rgba(226, 232, 240, 0.9); 
                    border-radius: 6px; 
                    height: 38px; 
                    overflow: hidden; 
                    transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .search-composite:focus-within { 
                    background: #ffffff; 
                    border-color: #0f172a; 
                    box-shadow: 0 8px 20px rgba(0,0,0,0.03); 
                }
                
                .search-icon-node { 
                    font-size: 0.5rem; 
                    font-weight: 950; 
                    background: #0f172a; 
                    color: white; 
                    padding: 0 0.75rem; 
                    height: 100%; 
                    display: flex; 
                    align-items: center; 
                    letter-spacing: 0.1em; 
                    white-space: nowrap;
                }
                .mono-input { background: none; border: none; padding: 0 1rem; font-family: 'Outfit', sans-serif; font-size: 0.7rem; font-weight: 600; width: 180px; outline: none; color: #0f172a; }
                .mono-date-input { 
                    background: rgba(241, 245, 249, 0.7); 
                    border: 1px solid rgba(226, 232, 240, 0.9); 
                    padding: 0 1rem; 
                    font-family: 'Outfit', sans-serif; 
                    font-size: 0.75rem; 
                    font-weight: 700; 
                    outline: none; 
                    border-radius: 6px; 
                    height: 38px; 
                    color: #475569; 
                    transition: all 0.4s; 
                }
                .mono-date-input:focus { background: #ffffff; border-color: #0f172a; }

                /* --- GRID ARCHITECTURE --- */
                .compact-grid-scroller { 
                    flex: 1; 
                    min-height: 0;
                    padding: 0 2rem 3rem 2rem; 
                    overflow-y: auto; 
                    position: relative;
                    width: 100%;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(15, 23, 42, 0.1) transparent;
                }
                
                .technical-data-grid { 
                    width: 100%; 
                    background: transparent; 
                    margin-top: 1rem;
                }
                
                .grid-head { 
                    display: grid; 
                    grid-template-columns: minmax(90px, 0.86fr) minmax(90px, 0.86fr) minmax(130px, 1.1fr) minmax(140px, 1.5fr) minmax(150px, 1.5fr) 0.5fr 0.7fr 0.7fr 1.1fr;
                    padding: 0.8rem 2.25rem;
                    background: #0f172a;
                    color: rgba(255,255,255,0.98);
                    font-size: 0.6rem;
                    font-weight: 900;
                    letter-spacing: 0.2em;
                    position: sticky;
                    top: 0;
                    z-index: 500;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.15);
                    border-radius: 6px 6px 0 0;
                    text-transform: uppercase;
                }

                .grid-row {
                    display: grid;
                    grid-template-columns: minmax(90px, 0.86fr) minmax(90px, 0.86fr) minmax(130px, 1.1fr) minmax(140px, 1.5fr) minmax(150px, 1.5fr) 0.5fr 0.7fr 0.7fr 1.1fr;
                    padding: 0.7rem 2.25rem;
                    background: #ffffff;
                    border-bottom: 1px solid rgba(15, 23, 42, 0.04);
                    align-items: center;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    animation: ultraSlideIn 0.5s ease-out forwards;
                    opacity: 0;
                }
                @keyframes ultraSlideIn { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                
                .grid-row:hover { 
                    background: #ffffff; 
                    z-index: 20; 
                    transform: scale(1.002);
                    box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
                    border-color: rgba(15, 23, 42, 0.08);
                }
                
                .grid-row:last-child { border-bottom: none; border-radius: 0 0 6px 6px; }

                /* --- DATA CELLS --- */
                .g-cell { font-size: 0.7rem; font-weight: 600; color: #475569; }
                .g-cell.mono { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #64748b; font-size: 0.65rem; letter-spacing: -0.02em; }
                .g-cell.highlight { color: #0f172a; font-weight: 850; }
                
                .patient-name { font-weight: 900; color: #0f172a; letter-spacing: -0.02em; font-size: 0.8rem; }
                .doctor-name { font-size: 0.65rem; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
                .amount-val { 
                    font-weight: 950; 
                    color: #059669; 
                    font-family: 'JetBrains Mono', monospace; 
                    font-size: 0.8rem; 
                    background: rgba(16, 185, 129, 0.04);
                    padding: 0.15rem 0.5rem;
                    border-radius: 3px;
                }

                .type-tag { font-size: 0.55rem; font-weight: 950; padding: 0.15rem 0.6rem; border-radius: 3px; border: 1px solid transparent; text-transform: uppercase; letter-spacing: 0.1em; }
                .type-tag.ipd { background: rgba(3, 105, 161, 0.06); color: #0369a1; border-color: rgba(3, 105, 161, 0.12); }
                .type-tag.opd { background: rgba(194, 65, 12, 0.06); color: #c2410c; border-color: rgba(194, 65, 12, 0.12); }

                .status-pill { font-size: 0.55rem; font-weight: 950; padding: 0.25rem 1rem; border-radius: 100px; letter-spacing: 0.1em; text-transform: uppercase; }
                .status-pill.verified { background: #0f172a; color: #ffffff; box-shadow: 0 6px 12px rgba(15, 23, 42, 0.15); }
                .status-pill.pending { background: #ef4444; color: #ffffff; box-shadow: 0 6px 12px rgba(239, 68, 68, 0.15); }

                .action-ribbon-compact { display: flex; gap: 0.5rem; justify-content: flex-end; }
                .ribbon-btn { 
                    background: #ffffff; 
                    border: 1px solid rgba(15, 23, 42, 0.08); 
                    width: 32px; 
                    height: 32px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 0.95rem; 
                    cursor: pointer; 
                    border-radius: 6px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    color: #64748b;
                }
                .ribbon-btn:hover { 
                    background: #0f172a; 
                    border-color: #0f172a; 
                    color: white; 
                    transform: translateY(-3px); 
                    box-shadow: 0 6px 15px rgba(0,0,0,0.1); 
                }
                .ribbon-btn.whatsapp:hover { background: #22c55e; border-color: #22c55e; }

                .grid-empty-state { padding: 8rem; text-align: center; }
                .empty-label { font-size: 0.8rem; color: #94a3b8; font-weight: 900; letter-spacing: 0.4em; text-transform: uppercase; opacity: 0.6; }

                .compact-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 1.5rem; background: #ffffff; }
                .micro-spinner { 
                    width: 32px; 
                    height: 32px; 
                    border: 3px solid rgba(15, 23, 42, 0.04); 
                    border-top-color: #0f172a; 
                    border-radius: 50%; 
                    animation: ultraSpin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite; 
                }
                @keyframes ultraSpin { to { transform: rotate(360deg); } }
                .compact-loader p { font-size: 0.7rem; font-weight: 900; letter-spacing: 0.3em; color: #0f172a; text-transform: uppercase; }
            `}</style>
        </>
    );
};

export default BillHistory;
