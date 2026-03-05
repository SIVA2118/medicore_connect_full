import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Biller/WodBills.css";

const CreateWodBill = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        patientName: "",
        treatment: "",
        billItems: [],
        isWod: true,
        paymentMode: "Cash"
    });

    const [newItem, setNewItem] = useState({ name: "", charge: "", qty: 1 });

    useEffect(() => {
        if (location.state?.patientName) {
            setFormData(prev => ({ ...prev, patientName: location.state.patientName }));
        }
    }, [location.state]);

    const handleAddItem = () => {
        if (!newItem.name || !newItem.charge) return;
        setFormData({
            ...formData,
            billItems: [...formData.billItems, newItem]
        });
        setNewItem({ name: "", charge: "", qty: 1 });
    };

    const handleRemoveItem = (index) => {
        const updated = formData.billItems.filter((_, i) => i !== index);
        setFormData({ ...formData, billItems: updated });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.billItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFormData({ ...formData, billItems: updatedItems });
    };

    const totalAmount = formData.billItems.reduce((acc, item) => acc + (item.charge * item.qty), 0);

    const handleSubmit = async () => {
        if (!formData.patientName) return alert("Please enter Patient Name");
        if (!formData.treatment) return alert("Please enter Treatment/Reason");
        if (formData.billItems.length === 0) return alert("Bill must have at least one item");

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post("http://localhost:5000/api/biller/create-bill", formData, config);
            alert("WOD Bill Generated Successfully!");
            navigate("/biller/wod");
        } catch (error) {
            console.error("Error creating WOD bill:", error);
            alert(error.response?.data?.message || "Failed to create WOD bill");
        }
    };

    return (
        <div className="wod-hub-container">
            <header className="wod-dashboard-header">
                <div className="wod-header-left">
                    <h1>WOD_CREATION_INTERFACE</h1>
                    <p>New Walk-in Patient Entry / Financial Acquisition</p>
                </div>
                <div className="wod-stats-ribbon">
                    <div className="stat-v-node">
                        <span className="stat-v-label">CURRENT_EXTENSION</span>
                        <span className="stat-v-val">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <button className="action-btn-neon" onClick={() => navigate("/biller/wod")}>
                        CANCEL_ENTRY ✕
                    </button>
                </div>
            </header>

            <div className="wod-data-matrix">
                <div className="wod-technical-grid" style={{ padding: '2rem' }}>
                    <div className="wod-form-section">
                        <div className="section-head" style={{ marginBottom: '1.5rem' }}>
                            <span className="count-chip">01</span>
                            PATIENT_SPECIFICATION
                        </div>
                        <div className="wod-controls-row">
                            <input
                                type="text"
                                className="search-terminal"
                                style={{ width: '100%' }}
                                placeholder="MANUAL_PATIENT_NAME_ENTRY..."
                                value={formData.patientName}
                                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="wod-form-section" style={{ marginTop: '2rem' }}>
                        <div className="section-head" style={{ marginBottom: '1.5rem' }}>
                            <span className="count-chip">02</span>
                            TREATMENT_METADATA
                        </div>
                        <div className="wod-controls-row">
                            <input
                                className="search-terminal"
                                style={{ width: '100%' }}
                                placeholder="PURPOSE_OF_VISIT_/_SERVICE_DESCRIPTION..."
                                value={formData.treatment}
                                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="wod-form-section" style={{ marginTop: '2rem' }}>
                        <div className="section-head" style={{ marginBottom: '1.5rem' }}>
                            <span className="count-chip">03</span>
                            FINANCIAL_LINE_ITEMS
                        </div>

                        <table className="grid-table" style={{ marginBottom: '1rem' }}>
                            <thead>
                                <tr>
                                    <th>DESCRIPTION</th>
                                    <th>COST_UNIT</th>
                                    <th>QTY</th>
                                    <th>EXTENSION</th>
                                    <th style={{ textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.billItems.map((item, index) => (
                                    <tr key={index} className="wod-row-animate">
                                        <td>
                                            <input
                                                className="table-input"
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td>₹{item.charge.toLocaleString()}</td>
                                        <td>{item.qty}</td>
                                        <td className="amount-node">₹{(item.charge * item.qty).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => handleRemoveItem(index)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--wod-text-dim)' }}>✕</button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="5" style={{ padding: '0.5rem' }}>
                                        <div className="wod-controls-row" style={{ margin: 0 }}>
                                            <input
                                                className="search-terminal"
                                                style={{ flex: 2 }}
                                                placeholder="ADD_NEW_ITEM_DESC..."
                                                value={newItem.name}
                                                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                            />
                                            <input
                                                type="number"
                                                className="search-terminal"
                                                style={{ flex: 1 }}
                                                placeholder="COST"
                                                value={newItem.charge}
                                                onChange={(e) => setNewItem({ ...newItem, charge: parseFloat(e.target.value) || '' })}
                                            />
                                            <input
                                                type="number"
                                                className="search-terminal"
                                                style={{ flex: 0.5 }}
                                                placeholder="QTY"
                                                value={newItem.qty}
                                                onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) || 1 })}
                                            />
                                            <button className="action-btn-neon" onClick={handleAddItem}>+ ADD</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="wod-form-section" style={{ marginTop: '2.5rem', borderTop: '1px solid var(--wod-border)', paddingTop: '2rem' }}>
                        <div className="wod-stats-ribbon" style={{ justifyContent: 'flex-end', width: '100%', gap: '3rem' }}>
                            <div className="stat-v-node">
                                <span className="stat-v-label">PAYMENT_TERMINAL</span>
                                <select
                                    className="date-terminal"
                                    value={formData.paymentMode}
                                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                                >
                                    <option value="Cash">CASH_LIQUID</option>
                                    <option value="Card">CARD_STRIPE</option>
                                    <option value="UPI">UPI_DIGITAL</option>
                                </select>
                            </div>
                            <div className="stat-v-node">
                                <span className="stat-v-label">AUTHORIZATION_TOTAL</span>
                                <span className="stat-v-val" style={{ color: 'var(--wod-accent)', fontSize: '1.5rem' }}>₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <button
                                className="action-btn-neon primary"
                                style={{ fontWeight: '800', padding: '0 2rem' }}
                                onClick={handleSubmit}
                            >
                                AUTHORIZE_&_COMMIT_BILL ➡
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWodBill;
