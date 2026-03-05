import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Doctor/Prescriptions.css";

export default function Prescriptions() {
    const { patientId, prescriptionId } = useParams();
    const isEditMode = Boolean(prescriptionId);

    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: "",
        notes: "",
        followUpDate: "",
        symptoms: "",
        department: "",
        medicines: [{ name: "", dosage: "", frequency: "", duration: "", partOfDay: "Morning-Afternoon-Night", mealInstruction: "After Meal" }]
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (isEditMode) {
                    const res = await axios.get(`http://localhost:5000/api/doctor/prescription/${prescriptionId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const p = res.data;
                    setPatient(p.patient);
                    setPrescriptionData({
                        topLevelId: p._id, // store if needed
                        diagnosis: p.diagnosis,
                        notes: p.notes,
                        followUpDate: p.followUpDate ? p.followUpDate.split('T')[0] : "",
                        symptoms: p.symptoms,
                        department: p.department,
                        medicines: p.medicines || []
                    });
                } else {
                    const res = await axios.get(`http://localhost:5000/api/doctor/patient/${patientId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setPatient(res.data);
                }
            } catch (err) {
                console.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [patientId, prescriptionId, isEditMode]);

    const handlePrescriptionSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const payload = {
                ...prescriptionData,
                // Only include patientId if creating new (although backend handles logic)
                ...(isEditMode ? {} : { patientId }),
                symptoms: prescriptionData.symptoms // Send as string to match backend Schema
            };

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/doctor/prescription/${prescriptionId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Prescription Updated Successfully!");
                navigate(`/doctor/prescription/view/${prescriptionId}`);
            } else {
                await axios.post("http://localhost:5000/api/doctor/prescription", payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Prescription Generated & Linked to Bill!");
                navigate(`/doctor/patient/${patientId}`);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to save prescription");
        }
    };

    const addMedicine = () => {
        setPrescriptionData({
            ...prescriptionData,
            medicines: [...prescriptionData.medicines, { name: "", dosage: "", frequency: "", duration: "", partOfDay: "Morning-Afternoon-Night", mealInstruction: "After Meal" }]
        });
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...prescriptionData.medicines];
        updated[index][field] = value;
        setPrescriptionData({ ...prescriptionData, medicines: updated });
    };

    const removeMedicine = (index) => {
        const updated = [...prescriptionData.medicines];
        updated.splice(index, 1);
        setPrescriptionData({ ...prescriptionData, medicines: updated });
    };

    if (loading) return <div className="loading-state">Loading form...</div>;

    return (
        <div className="prescription-container">
            <div className="prescription-card">
                <header style={{ marginBottom: '3rem' }}>
                    <h2>{isEditMode ? "Edit Prescription" : "Issue New Prescription"}</h2>
                    <div style={{ background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '16px', display: 'flex', gap: '2rem' }}>
                        <p><strong>Patient:</strong> {patient?.name}</p>
                        <p><strong>Age/Gender:</strong> {patient?.age} / {patient?.gender}</p>
                        <p><strong>Specialization:</strong> {patient?.assignedDoctor?.specialization}</p>
                    </div>
                </header>

                <form onSubmit={handlePrescriptionSubmit}>
                    <div className="form-section">
                        <h3>1. Clinical Context</h3>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Diagnosis / Problem</label>
                                <input className="form-input" placeholder="e.g. Acute Gastritis" value={prescriptionData.diagnosis} onChange={e => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Symptoms (comma separated)</label>
                                <input className="form-input" placeholder="Pain, Nausea..." value={prescriptionData.symptoms} onChange={e => setPrescriptionData({ ...prescriptionData, symptoms: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="input-group">
                                <label>Department</label>
                                <input className="form-input" placeholder="General, Cardiology..." value={prescriptionData.department} onChange={e => setPrescriptionData({ ...prescriptionData, department: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Follow-up Date</label>
                                <input type="date" className="form-input" value={prescriptionData.followUpDate} onChange={e => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>2. Medicines & Dosage</h3>
                        <div className="table-wrapper">
                            <table className="medicines-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '25%' }}>Medicine Name</th>
                                        <th style={{ width: '12%' }}>Dosage</th>
                                        <th style={{ width: '12%' }}>Frequency</th>
                                        <th style={{ width: '12%' }}>Duration</th>
                                        <th style={{ width: '15%' }}>Time</th>
                                        <th style={{ width: '15%' }}>Instruction</th>
                                        <th style={{ width: '5%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptionData.medicines.map((med, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    placeholder="Paracetamol"
                                                    value={med.name}
                                                    onChange={e => updateMedicine(index, 'name', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    placeholder="1 Tab"
                                                    value={med.dosage}
                                                    onChange={e => updateMedicine(index, 'dosage', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    placeholder="1-0-1"
                                                    value={med.frequency}
                                                    onChange={e => updateMedicine(index, 'frequency', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    placeholder="5 Days"
                                                    value={med.duration}
                                                    onChange={e => updateMedicine(index, 'duration', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td>
                                                <select
                                                    value={med.partOfDay}
                                                    onChange={e => updateMedicine(index, 'partOfDay', e.target.value)}
                                                >
                                                    <option>Morning-Afternoon-Night</option>
                                                    <option>Morning only</option>
                                                    <option>Night only</option>
                                                    <option>Morning & Night</option>
                                                    <option>Every 6 hours</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select
                                                    value={med.mealInstruction}
                                                    onChange={e => updateMedicine(index, 'mealInstruction', e.target.value)}
                                                >
                                                    <option>After Meal</option>
                                                    <option>Before Meal</option>
                                                    <option>With Meal</option>
                                                    <option>Empty Stomach</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-remove-row" onClick={() => removeMedicine(index)} title="Remove">&times;</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button type="button" className="btn-add" onClick={addMedicine}>+ Add Medicine Row</button>
                    </div>

                    <div className="form-section">
                        <h3>3. Additional Instructions</h3>
                        <textarea
                            placeholder="e.g. Avoid cold water, complete the course..."
                            className="notes-area"
                            value={prescriptionData.notes}
                            onChange={e => setPrescriptionData({ ...prescriptionData, notes: e.target.value })}
                        />
                    </div>

                    <div className="actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Discard</button>
                        <button type="submit" className="btn-submit">{isEditMode ? "Update Prescription" : "Generate Prescription"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
