import React, { useRef, useEffect } from "react";
import "../styles/Biller/BillModal.css";

const BillModal = ({ bill, onClose, autoPrint = false }) => {
    useEffect(() => {
        if (autoPrint) {
            // Small timeout to ensure DOM is ready
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [autoPrint]);

    if (!bill) return null;

    const printBill = () => {
        window.print();
    };

    // Helper to convert number to words (Simplified for Rupees)
    const toWords = (amount) => {
        const words = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
            "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
        ];
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

        const numToStr = (n) => {
            if (n < 20) return words[n];
            const digit = n % 10;
            if (n < 100) return tens[Math.floor(n / 10)] + (digit ? " " + words[digit] : "");
            if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 == 0 ? "" : " And " + numToStr(n % 100));
            return numToStr(Math.floor(n / 1000)) + " Thousand" + (n % 1000 == 0 ? "" : " " + numToStr(n % 1000));
        };

        if (amount === 0) return "Zero";
        return numToStr(amount) + " Only";
    };

    const formatAddress = (addr) => {
        if (!addr) return "-";
        // Handle if address is just a string
        if (typeof addr === 'string') return addr;

        // Handle object structure
        const parts = [
            addr.line1,
            addr.line2,
            addr.city,
            addr.state,
            addr.pincode
        ].filter(part => part && part.trim()); // Remove empty/null values

        return parts.length > 0 ? parts.join(", ") : "-";
    };

    return (
        <div className="modal-overlay bill-modal-overlay" onClick={onClose}>
            <div className="modal-content bill-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header no-print">
                    <h2>Bill Details</h2>
                    <div className="header-actions">
                        <button onClick={printBill} className="print-btn">🖨️ Print</button>
                        <button onClick={onClose} className="close-btn">×</button>
                    </div>
                </div>

                <div className="bill-print-area" id="printable-bill">
                    {/* Brand Header */}
                    <div className="brand-header">
                        <div className="hospital-title">
                            <h1>NS multispeciality hospital</h1>
                            <div className="hospital-details">
                                <p>123, Main Road, Coimbatore - 641001</p>
                                <p>Phone: +91 99421 29724 | Email: help@nshospital.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="invoice-title">
                        <h2>Medical Invoice</h2>
                    </div>

                    {/* Meta Info Grid - Split Layout */}
                    <div className="meta-info-container">
                        <div className="meta-section billed-to">
                            <h3 className="section-title">Billed To:</h3>
                            <div className="meta-row name-row">
                                <span className="val bold">{bill.patient?.name || bill.patientName || "Walk-in Patient"}</span>
                            </div>
                            <div className="meta-row">
                                <span className="val">{bill.patient?.phone || "-"}</span>
                            </div>
                            <div className="meta-row address-row">
                                <span className="val">{formatAddress(bill.patient?.address)}</span>
                            </div>
                        </div>

                        <div className="meta-section invoice-details">
                            <h3 className="section-title">Invoice Details:</h3>
                            <div className="meta-row">
                                <span className="label">Bill No:</span>
                                <span className="val">#{bill._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="meta-row">
                                <span className="label">Date:</span>
                                <span className="val">{new Date(bill.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="meta-row">
                                <span className="label">Doctor:</span>
                                <span className="val">{bill.doctor?.name || "Dr. Aravind Kumar"}</span>
                            </div>
                            <div className="meta-row">
                                <span className="label">Type:</span>
                                <span className="val uppercase">{bill.isWod ? "WOD (Walk-in)" : "OPD"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        <table className="receipt-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                                    <th>Description</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Rate</th>
                                    <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                                    <th style={{ width: '120px', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.billItems?.map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                        <td className="desc-cell">{item.name}</td>
                                        <td style={{ textAlign: 'right' }}>{item.charge.toFixed(2)}</td>
                                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                        <td style={{ textAlign: 'right' }}>{(item.qty * item.charge).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Summary Box */}
                    <div className="footer-summary">
                        <div className="total-row">
                            <span className="label">Total:</span>
                            <span className="amount">Rs. {bill.amount.toFixed(2)}</span>
                        </div>
                        <div className="grand-total-row">
                            <span className="label">Grand Total:</span>
                            <span className="amount">Rs. {bill.amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillModal;
