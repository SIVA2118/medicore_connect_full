import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/Doctor/MyPatients.css";

export default function AllPrescriptions() {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/doctor/patients", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(res.data);
        } catch (err) {
            console.error("Failed to fetch patients");
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );

    return (
        <div className="my-patients-container">
            <header className="page-header">
                <div>
                    <h1>Digital Prescriptions</h1>
                    <p>Select a patient to issue a new medication list</p>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {loading ? <div className="loading-state">Loading assigned patients...</div> : (
                <div className="patients-grid">
                    {filteredPatients.length === 0 ? <div className="empty-state">No patients found.</div> : filteredPatients.map(p => (
                        <div className="patient-card selection-card" key={p._id} onClick={() => navigate(`/doctor/prescription/create/${p._id}`)}>
                            <div className="card-avatar" style={{ background: 'var(--accent-500)' }}>{p.name.charAt(0)}</div>
                            <div className="card-info">
                                <h3>{p.name}</h3>
                                <div className="med-tags">
                                    <span>{p.gender}</span>
                                    <span>{p.age} Yrs</span>
                                </div>
                                <p className="phone">📞 {p.phone}</p>
                            </div>
                            <div className="card-footer">
                                <button className="btn-view" style={{ width: '100%', background: 'var(--accent-600)', color: 'white' }}>Issue Prescription →</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
