import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/Biller/CreateBill.css";

const CreateBill = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        patientId: "",
        doctorId: "",
        treatment: "",
        billItems: [],
        prescriptionId: null,
        reportId: null,
        scanReportIds: [],
        labReportIds: [],
        paymentMode: "Cash"
    });

    const [newItem, setNewItem] = useState({ name: "", charge: "", qty: 1 });
    const [isPatientLocked, setIsPatientLocked] = useState(false);
    const [isDoctorLocked, setIsDoctorLocked] = useState(false);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    // Handle automated selection from navigation
    useEffect(() => {
        if (location.state?.patientId) {
            setFormData(prev => ({ ...prev, patientId: location.state.patientId }));
            setIsPatientLocked(true);
            fetchPatientDetails(location.state.patientId);
        }
        if (location.state?.doctorId) {
            setFormData(prev => ({ ...prev, doctorId: location.state.doctorId }));
            setIsDoctorLocked(true);
        }
    }, [location.state]);

    const fetchDropdowns = async () => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const [pRes, dRes] = await Promise.all([
                axios.get("http://localhost:5000/api/biller/patients", config),
                axios.get("http://localhost:5000/api/biller/doctors", config)
            ]);
            setPatients(pRes.data.patients || []);
            setDoctors(dRes.data.doctors || []);
        } catch (error) {
            console.error("Fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientDetails = async (pid) => {
        if (!pid) return;
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Auto-fetch unbilled records for this patient
            const [prescRes, reportRes, scanRes, labRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/biller/prescription/${pid}`, config),
                axios.get(`http://localhost:5000/api/biller/report/${pid}`, config),
                axios.get(`http://localhost:5000/api/biller/unbilled-scan-reports/${pid}`, config),
                axios.get(`http://localhost:5000/api/biller/unbilled-lab-reports/${pid}`, config)
            ]);

            // Simple logic: if there is a prescription, use its treatment
            if (prescRes.data.prescription) {
                const latest = prescRes.data.prescription;
                setFormData(prev => ({
                    ...prev,
                    treatment: latest.treatment || prev.treatment,
                    prescriptionId: latest._id
                }));
            }

            // Collect IDs for automated billing
            setFormData(prev => ({
                ...prev,
                scanReportIds: (scanRes.data.reports || []).map(r => r._id),
                labReportIds: (labRes.data.reports || []).map(r => r._id),
                reportId: reportRes.data.report?._id || null
            }));

        } catch (error) {
            console.error("Detail fetch failed", error);
        }
    };

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
        if (!formData.patientId) return alert("Please select a patient");
        if (!formData.treatment) return alert("Please enter treatment");
        if (formData.billItems.length === 0) return alert("Bill must have at least one item");

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post("http://localhost:5000/api/biller/create-bill", formData, config);
            alert("Bill Generated Successfully!");
            navigate("/biller/history");
        } catch (error) {
            alert(error.response?.data?.message || "Submit failed");
        }
    };

    if (loading) return <div>Loading records...</div>;

    return (
        <div className="create-bill-container">
            <header className="dashboard-header">
                <h1>Create Registered Patient Bill</h1>
            </header>

            <div className="bill-card">
                <div className="section-title">Record Specification</div>
                <div className="form-grid">
                    <div className="input-grp">
                        <label>Select Patient</label>
                        <select
                            value={formData.patientId}
                            onChange={(e) => {
                                setFormData({ ...formData, patientId: e.target.value });
                                fetchPatientDetails(e.target.value);
                            }}
                            disabled={isPatientLocked}
                            className="premium-input"
                        >
                            <option value="">-- Choose Patient --</option>
                            {patients.map(p => (
                                <option key={p._id} value={p._id}>{p.name} ({p.mrn})</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-grp">
                        <label>Attending Doctor</label>
                        <select
                            value={formData.doctorId}
                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                            disabled={isDoctorLocked}
                            className="premium-input"
                        >
                            <option value="">-- Choose Doctor --</option>
                            {doctors.map(d => (
                                <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="section-title">Case details</div>
                <div className="input-grp" style={{ marginBottom: '2rem' }}>
                    <label>Treatment / Reason</label>
                    <input
                        placeholder="Nature of visit/treatment..."
                        value={formData.treatment}
                        onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                    />
                </div>

                <div className="section-title">Financial Items</div>
                <table className="bill-items-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Item Description</th>
                            <th style={{ width: '20%' }}>Unit Cost (₹)</th>
                            <th style={{ width: '20%' }}>Quantity</th>
                            <th style={{ width: '20%' }}>Extension</th>
                            <th style={{ width: '50px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.billItems.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: "center", color: "#888" }}>No financial items recorded</td></tr>
                        )}
                        {formData.billItems.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        value={item.name}
                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                        className="table-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.charge}
                                        onChange={(e) => handleItemChange(index, 'charge', parseFloat(e.target.value) || 0)}
                                        className="table-input"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(index, 'qty', parseInt(e.target.value) || 1)}
                                        className="table-input"
                                    />
                                </td>
                                <td>₹{(item.charge * item.qty).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleRemoveItem(index)} style={{ color: "red", background: "none", border: "none" }}>❌</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="form-grid" style={{ gridTemplateColumns: "2fr 1fr 1fr auto", alignItems: "end", gap: "1rem" }}>
                    <div className="input-grp">
                        <input
                            placeholder="Add New Item..."
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                    </div>
                    <div className="input-grp">
                        <input
                            type="number"
                            placeholder="Cost"
                            value={newItem.charge}
                            onChange={(e) => setNewItem({ ...newItem, charge: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="input-grp">
                        <input
                            type="number"
                            placeholder="Qty"
                            value={newItem.qty}
                            onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) || 1 })}
                        />
                    </div>
                    <button className="btn-add-item" onClick={handleAddItem}>+ Add Item</button>
                </div>

                <div className="total-section">
                    <div className="total-row">
                        <span className="total-label">Transaction Mode:</span>
                        <select
                            className="payment-select"
                            value={formData.paymentMode}
                            onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', marginLeft: '10px' }}
                        >
                            <option value="Cash">Cash 💵</option>
                            <option value="Card">Card 💳</option>
                            <option value="UPI">UPI 📱</option>
                        </select>
                    </div>
                    <div className="total-row">
                        <span className="total-label">Subtotal Amount:</span>
                        <span className="total-value">₹{totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                <div className="actions-row">
                    <button className="btn-discard" onClick={() => navigate("/biller")}>Cancel</button>
                    <button className="btn-generate" onClick={handleSubmit}>Authorize & Generate Bill</button>
                </div>
            </div>
        </div>
    );
};

export default CreateBill;
