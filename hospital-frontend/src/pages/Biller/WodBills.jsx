import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Biller/WodBills.css";
import BillModal from "../../components/BillModal";

const WodBills = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/biller/all-bills", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const wodOnly = (res.data.bills || []).filter(b => b.isWod);
            setBills(wodOnly);
        } catch (error) {
            console.error("Failed to fetch WOD records", error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (bill) => {
        setSelectedBill(bill);
    };

    const filteredBills = bills.filter(bill => {
        const searchLower = searchTerm.toLowerCase();
        return (
            bill._id.toLowerCase().includes(searchLower) ||
            (bill.patientName || "").toLowerCase().includes(searchLower) ||
            (bill.treatment || "").toLowerCase().includes(searchLower)
        ) && (
                !filterDate || new Date(bill.createdAt).toDateString() === new Date(filterDate).toDateString()
            );
    });

    const totalRevenue = filteredBills.reduce((acc, b) => acc + b.amount, 0);

    if (loading) return (
        <div className="wod-hub-container">
            <div className="wod-dashboard-header">
                <div className="wod-header-left">
                    <h1>SYNCHRONIZING_WOD_RECORDS...</h1>
                    <p>PLEASE_WAIT_FOR_STATION_READY</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="wod-hub-container">
            <header className="wod-dashboard-header">
                <div className="wod-header-left">
                    <h1>WOD_BILLS_COMMAND_CENTER</h1>
                    <p>Walk-in Patient Financial Control Hub</p>
                </div>

                <div className="wod-stats-ribbon">
                    <div className="stat-v-node">
                        <span className="stat-v-label">ACTIVE_TRANSACTIONS</span>
                        <span className="stat-v-val">{filteredBills.length}</span>
                    </div>
                    <div className="stat-v-node">
                        <span className="stat-v-label">HUB_TOTAL_CREDIT</span>
                        <span className="stat-v-val" style={{ color: 'var(--wod-success)' }}>₹{totalRevenue.toLocaleString()}</span>
                    </div>
                    <button
                        className="action-btn-neon primary"
                        style={{ height: 'fit-content', padding: '0.6rem 1.2rem' }}
                        onClick={() => navigate("/biller/wod/create")}
                    >
                        + NEW_WOD_BILL
                    </button>
                </div>
            </header>

            <div className="wod-data-matrix">
                <div className="wod-controls-row">
                    <input
                        type="text"
                        className="search-terminal"
                        placeholder="SEARCH_BY_PATIENT_NAME_OR_IDENTIFIER..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <input
                        type="date"
                        className="date-terminal"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>

                <div className="wod-technical-grid">
                    <table className="grid-table">
                        <thead>
                            <tr>
                                <th>TRANSACTION_ID</th>
                                <th>PATIENT_IDENT</th>
                                <th>TIMESTAMP</th>
                                <th>TREATMENT_ENTRY</th>
                                <th>CREDIT_VALUE</th>
                                <th>MODE</th>
                                <th style={{ textAlign: 'right' }}>OPERATIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBills.map((bill, index) => (
                                <tr key={bill._id} className="wod-row-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <td className="id-tag">#{bill._id.slice(-8).toUpperCase()}</td>
                                    <td className="patient-name-cell">{bill.patientName || "WALK-IN_PATIENT"}</td>
                                    <td>{new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {new Date(bill.createdAt).toLocaleDateString()}</td>
                                    <td>{bill.treatment}</td>
                                    <td className="amount-node">₹{bill.amount.toLocaleString()}</td>
                                    <td>
                                        <span className="status-capsule">{bill.paymentMode || "CASH"}</span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleView(bill)} className="action-btn-neon">
                                            VIEW_METADATA ➡
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredBills.length === 0 && (
                        <div className="wod-empty-matrix">
                            NO_ACTIVE_RECORDS_MATCH_TERMINAL_FILTER
                        </div>
                    )}
                </div>
            </div>

            {selectedBill && (
                <BillModal
                    bill={selectedBill}
                    onClose={() => setSelectedBill(null)}
                />
            )}
        </div>
    );
};

export default WodBills;
