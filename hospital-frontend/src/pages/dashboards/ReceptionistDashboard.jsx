import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReceptionistNavbar from "../../components/ReceptionistNavbar";
import "../../styles/dashboards/ReceptionistDashboard.css";

export default function ReceptionistDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayPatients: 0,
    availableDoctors: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/receptionist/dashboard-stats", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setStats(res.data.stats);
        setRecentPatients(res.data.recentPatients);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ReceptionistNavbar />
      <div className="receptionist-dashboard">
        <header className="dashboard-header">
          <h1>Welcome Back, Receptionist</h1>
          <p>Manage patient registrations and appointments efficiently.</p>
        </header>

        {/* STATS CARDS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-info">
              <h3>Total Patients</h3>
              <p className="stat-value">{stats.totalPatients}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">📅</div>
            <div className="stat-info">
              <h3>New Today</h3>
              <p className="stat-value">{stats.todayPatients}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">👨‍⚕️</div>
            <div className="stat-info">
              <h3>Doctors</h3>
              <p className="stat-value">{stats.availableDoctors}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content-grid">
          {/* RECENT REGISTRATIONS */}
          <div className="recent-activity-section">
            <div className="section-header">
              <h2>Recent Registrations</h2>
              <Link to="/receptionist/patients" className="view-all-link">View All &rarr;</Link>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="recent-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age/Sex</th>
                    <th>Type</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.length > 0 ? (
                    recentPatients.map(p => (
                      <tr key={p._id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.age} / {p.gender}</td>
                        <td><span className={`badge ${p.patientType}`}>{p.patientType}</span></td>
                        <td>{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4">No recent patients.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="quick-actions-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <Link to="/receptionist/add-patient" className="action-card">
                <span className="action-icon">➕</span>
                Register New Patient
              </Link>
              <Link to="/receptionist/patients" className="action-card">
                <span className="action-icon">📂</span>
                View Patient List
              </Link>
              <Link to="/receptionist/doctors" className="action-card">
                <span className="action-icon">🩺</span>
                Check Doctor Availability
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
