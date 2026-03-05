import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Biller/BillerDashboard.css";
import "../../styles/Biller/BillHistory.css"; // Shared styles
import BillModal from "../../components/BillModal";

const TotalCollection = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [allBills, setAllBills] = useState([]); // Master list
    const [bills, setBills] = useState([]); // Filtered list
    const [stats, setStats] = useState({
        Cash: { count: 0, amount: 0 },
        Card: { count: 0, amount: 0 },
        UPI: { count: 0, amount: 0 }
    });

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState(""); // Default: All time (empty)
    const [selectedBill, setSelectedBill] = useState(null);
    const [autoPrint, setAutoPrint] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    // Re-run filter and stats calculation when date or master list changes
    useEffect(() => {
        if (allBills.length > 0) {
            applyFilter();
        }
    }, [filterDate, allBills]);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/biller/all-bills", {
                headers: { Authorization: `Bearer ${token}` }
            });

            const fetchedBills = res.data.bills || [];
            console.log("Fetched Bills:", fetchedBills.length);
            setAllBills(fetchedBills);
            setBills(fetchedBills); // Initial set (will be overridden by useEffect if filter exists)
        } catch (error) {
            console.error("Failed to fetch bills", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let filtered = [...allBills];

        // 1. Date Filter
        if (filterDate) {
            const selectedDateStr = new Date(filterDate).toDateString();
            filtered = filtered.filter(b => new Date(b.createdAt).toDateString() === selectedDateStr);
        }

        // 2. Sort Newest First
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 3. Calculate Stats based on FILTERED data
        const statsMap = {
            Cash: { count: 0, amount: 0 },
            Card: { count: 0, amount: 0 },
            UPI: { count: 0, amount: 0 }
        };

        filtered.forEach(bill => {
            const mode = bill.paymentMode || "Cash";
            if (statsMap[mode]) {
                statsMap[mode].count += 1;
                statsMap[mode].amount += bill.amount;
            }
        });

        setBills(filtered);
        setStats(statsMap);
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
                    `Dear ${bill.patient.gender === 'Male' ? 'Mr.' : 'Ms.'} ${bill.patient.name},\n\nGreetings from NS multispeciality hospital\n\nWe would like to inform you that the bill for your recent medical consultation with Dr. ${bill.doctor?.name || 'Duty Doctor'} has been successfully generated. The bill includes the charges related to the consultation and has been prepared as per hospital records.\n\nFor your convenience, you may kindly view and download the detailed bill in PDF format using the link provided below:\n\nView Bill (PDF):\n${pdfLink}\n\nWe request you to review the document and retain a copy for your records. Should you require any clarification regarding the bill or need further assistance, please do not hesitate to contact our support team.\n\nContact Number: 9942129724\n\nThank you for choosing our healthcare services. We wish you good health and look forward to serving you again.\n\nWarm regards,\nBilling Department\nNS multispeciality hospital`
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
            alert(`⚠️ Auto-Attach unavailable for this chat.\n\n👉 SYSTEM NOTICE: The WhatsApp window is open. Please DRAG & DROP the downloaded file into the chat to send it manually.`);
        }
    };

    const handleSendWhatsApp = (bill) => {
        if (bill.patient?.phone) {
            const rawPhone = bill.patient.phone.replace(/\D/g, "");
            const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
            const pdfLink = `http://localhost:5000/api/biller/view-pdf/${bill._id}`;

            const message = encodeURIComponent(
                `Dear ${bill.patient.gender === 'Male' ? 'Mr.' : 'Ms.'} ${bill.patient.name},\n\nGreetings from NS multispeciality hospital\n\nWe would like to inform you that the bill for your recent medical consultation with Dr. ${bill.doctor?.name || 'Duty Doctor'} has been successfully generated. The bill includes the charges related to the consultation and has been prepared as per hospital records.\n\nFor your convenience, you may kindly view and download the detailed bill in PDF format using the link provided below:\n\nView Bill (PDF):\n${pdfLink}\n\nWe request you to review the document and retain a copy for your records. Should you require any clarification regarding the bill or need further assistance, please do not hesitate to contact our support team.\n\nContact Number: 9942129724\n\nThank you for choosing our healthcare services. We wish you good health and look forward to serving you again.\n\nWarm regards,\nBilling Department\nNS multispeciality hospital`
            );

            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        } else {
            alert("Patient has no phone number.");
        }
    };

    if (loading) return <div className="biller-dashboard">Loading...</div>;

    return (
        <div className="biller-dashboard" style={{ height: 'auto', minHeight: '100vh' }}>
            <header className="dashboard-header" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} className="action-btn" style={{ padding: '0.5rem 1rem' }}>
                        ← Back
                    </button>
                    <h1>Total Collection Breakdown</h1>
                </div>
                <div className="header-actions">
                    <p>{filterDate ? new Date(filterDate).toDateString() : "All/Recent Transactions"}</p>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-icon blue">💰</div>
                    <div className="stat-info">
                        <h3>Total Collected</h3>
                        <p>₹{Object.values(stats).reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                        {filterDate && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({new Date(filterDate).toLocaleDateString()})</span>}
                    </div>
                </div>
                {Object.entries(stats).map(([mode, data]) => (
                    <div className="stat-card" key={mode}>
                        <div className="stat-icon green">
                            {mode === 'Cash' ? '💵' : mode === 'Card' ? '💳' : '📱'}
                        </div>
                        <div className="stat-info">
                            <h3>{mode}</h3>
                            <p>₹{data.amount.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>({data.count})</span></p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="filter-section" style={{
                background: 'white',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-sm)',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: 500, color: '#475569' }}>Filter Date</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#475569' }}>Search</label>
                    <input
                        type="text"
                        placeholder="Search by Name, ID, MRN or Mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ width: '100%', padding: '0.625rem' }}
                    />
                </div>
            </div>

            {/* Detailed Table */}
            <section className="recent-bills-section">
                <h2>Transactions List</h2>
                <div className="table-responsive">
                    <table className="clean-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Bill ID</th>
                                <th>Patient ID</th>
                                <th>Patient Name</th>
                                <th>Doctor</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.filter(bill => {
                                const matchesSearch =
                                    (bill.patient?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                    (bill._id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                    (bill.patient?.mrn?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                                    (bill.patient?.phone?.toString() || "").includes(searchTerm);
                                return matchesSearch;
                            }).map(bill => (
                                <tr key={bill._id}>
                                    <td className="date-cell">{new Date(bill.createdAt).toLocaleDateString("en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td>
                                        <div className="invoice-cell">
                                            <div className="file-icon">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M14 2V8H20" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16 13H8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M16 17H8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M10 9H9H8" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <span className="invoice-id">#{bill._id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 500, color: '#64748b' }}>{bill.patient?.mrn || "N/A"}</td>
                                    <td className="patient-name">{bill.patient?.name || "Unknown"}</td>
                                    <td className="text-gray">{bill.doctor?.name || "-"}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: bill.patient?.patientType === 'IPD' ? '#e0e7ff' : '#f0f9ff',
                                            color: bill.patient?.patientType === 'IPD' ? '#4338ca' : '#0369a1',
                                            fontSize: '0.8rem',
                                            fontWeight: 600
                                        }}>
                                            {bill.patient?.patientType || "OPD"}
                                        </span>
                                    </td>
                                    <td className="amount-cell">₹{bill.amount.toLocaleString()}</td>
                                    <td><span className={`status-pill ${bill.paid ? 'paid' : 'pending'}`}>{bill.paid ? "Completed" : "Pending"}</span></td>
                                    <td>
                                        <div className="actions-flex">
                                            <button onClick={() => handleView(bill)} title="View" className="icon-btn">👁️</button>
                                            <button onClick={() => handlePrint(bill)} title="Print" className="icon-btn">🖨️</button>
                                            <button onClick={() => handleGeneratePDF(bill)} title="Download PDF" className="icon-btn">⬇️</button>
                                            <button onClick={() => handleSendWhatsApp(bill)} title="WhatsApp" className="icon-btn">📱</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Bill View Modal */}
            {selectedBill && (
                <BillModal
                    bill={selectedBill}
                    autoPrint={autoPrint}
                    onClose={() => setSelectedBill(null)}
                />
            )}
        </div>
    );
};

export default TotalCollection;
