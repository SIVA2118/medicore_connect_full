import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboards/DoctorDashboard.css";

export default function DoctorDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalReports: 0,
        totalPrescriptions: 0,
        todayVisits: []
    });
    const [doctorName, setDoctorName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/doctor/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctorName(res.data.name);

                const statsRes = await axios.get("http://localhost:5000/api/doctor/dashboard-stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data");
            }
        };
        fetchData();
    }, []);

    return (
        <div className="doctor-dashboard-container">
            <header className="welcome-banner">
                <div className="banner-content">
                    <h1>Welcome back, {doctorName || "Doctor"}</h1>
                    <p>Here is an overview of your clinical workspace for today.</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon patients">👥</div>
                    <div className="stat-info">
                        <h3>My Patients</h3>
                        <p>{stats.totalPatients}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon reports">📄</div>
                    <div className="stat-info">
                        <h3>Reports Filed</h3>
                        <p>{stats.totalReports}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon prescriptions">💊</div>
                    <div className="stat-info">
                        <h3>Prescriptions</h3>
                        <p>{stats.totalPrescriptions}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <h2>🚀 Quick Clinical Actions</h2>
                    <div className="quick-links-grid">
                        <div className="quick-link-btn" onClick={() => navigate("/doctor/patients")}>
                            <span>📋</span>
                            <p>My Patients</p>
                        </div>
                        <div className="quick-link-btn" onClick={() => navigate("/doctor/create-report")}>
                            <span>📝</span>
                            <p>New Report</p>
                        </div>
                        <div className="quick-link-btn" onClick={() => navigate("/doctor/prescriptions")}>
                            <span>💊</span>
                            <p>Issue Rx</p>
                        </div>
                        <div className="quick-link-btn" onClick={() => navigate("/doctor/availability")}>
                            <span>⏰</span>
                            <p>Availability</p>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <h2>📅 Today's Schedule</h2>
                    {stats.todayVisits?.length > 0 ? (
                        <div className="todays-visits">
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {stats.todayVisits.map((visit, index) => (
                                    <li key={index} style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--slate-100)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ fontWeight: '600', color: 'var(--primary-800)' }}>{visit.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                                            Visit Recorded: {new Date(visit.opdDetails.lastVisitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                            <p>No more appointments scheduled for today.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
