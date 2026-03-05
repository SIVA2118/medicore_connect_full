import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/dashboards/adminDashboard.css";
import hospitalImg from "../../assets/hospital.jpg";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/admin/dashboard-stats", {
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
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Analyzing Hospital Data...</p>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        <header className="page-header">
          <div className="header-info">
            <span className="badge-new">SYSTEM V2.0</span>
            <h1>Hospital Executive Summary</h1>
            <p>High-level operational overview & business intelligence</p>
          </div>
          <div className="current-date-v2">
            <div className="date-icon">📅</div>
            <div className="date-text">
              <span className="day">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
              <span className="full-date">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* ================= TRENDING INSIGHTS ================= */}
        <section className="insights-banner">
          <div className="insight-item">
            <span className="insight-icon">✨</span>
            <p><strong>Operational Insight:</strong> Revenue is up by 12% compared to last month. Consider review of pending billing cycles.</p>
          </div>
        </section>

        {/* ================= QUICK STATS V2 ================= */}
        <section className="stats-grid-v2">
          <div className="stat-card-v2 patients-v2">
            <div className="stat-main">
              <div className="stat-info">
                <h3>Active Patients</h3>
                <p className="stat-value">{stats?.clinical?.patients || 0}</p>
              </div>
              <div className="stat-visual">
                <div className="trend positive">↑ 4.2%</div>
              </div>
            </div>
            <div className="stat-footer-v2">
              <span>Total Admissions: {stats?.clinical?.patients || 0}</span>
            </div>
            <div className="card-glass-effect"></div>
          </div>

          <div className="stat-card-v2 staff-v2">
            <div className="stat-main">
              <div className="stat-info">
                <h3>Medical Force</h3>
                <p className="stat-value">{stats?.staff?.doctors + stats?.staff?.scanners || 0}</p>
              </div>
              <div className="stat-visual">
                <div className="trend">Stable</div>
              </div>
            </div>
            <div className="stat-footer-v2">
              <span>{stats?.staff?.doctors} Doctors | {stats?.staff?.scanners} Scanners</span>
            </div>
            <div className="card-glass-effect"></div>
          </div>

          <div className="stat-card-v2 reports-v2">
            <div className="stat-main">
              <div className="stat-info">
                <h3>Total Diagnostics</h3>
                <p className="stat-value">{stats?.clinical?.scanReports + stats?.clinical?.doctorReports || 0}</p>
              </div>
              <div className="stat-visual">
                <div className="trend positive">↑ 8.9%</div>
              </div>
            </div>
            <div className="stat-footer-v2">
              <span>Scans: {stats?.clinical?.scanReports} | Clinical: {stats?.clinical?.doctorReports}</span>
            </div>
            <div className="card-glass-effect"></div>
          </div>
        </section>

        <div className="dashboard-grid-main">
          {/* ================= LEFT COLUMN: RECENT REGISTRATIONS ================= */}
          <section className="main-content-left">
            <div className="section-card-v2">
              <div className="card-header-v2">
                <div>
                  <h2>Recent Registrations</h2>
                  <p className="card-subtitle">Latest 5 patients added to the system</p>
                </div>
                <Link to="/admin/reports" className="btn-outline-v2" style={{ textDecoration: 'none' }}>View All Records</Link>
              </div>

              <div className="patient-list-v2">
                {recentPatients.length > 0 ? (
                  recentPatients.map((patient, index) => (
                    <div key={patient._id} className="patient-row-v2" style={{ animationDelay: `${index * 0.1}s` }}>
                      <Link to={`/admin/patient/${patient._id}`} className="patient-avatar-v2" style={{ textDecoration: 'none' }}>
                        {(patient.name || "?").charAt(0)}
                      </Link>
                      <div className="patient-info-v2">
                        <h4>{patient.name}</h4>
                        <span className="mrn-tag">{patient.mrn}</span>
                      </div>
                      <div className="patient-type-v2">
                        <span className={`type-badge-v2 ${(patient.patientType || "OPD").toLowerCase()}`}>
                          {patient.patientType || "N/A"}
                        </span>
                      </div>
                      <div className="patient-date-v2">
                        {new Date(patient.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="patient-action-v2">
                        <Link to={`/admin/patient/${patient._id}`} className="icon-btn-v2" style={{ textDecoration: 'none' }}>↗</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-v2">No recent data available</div>
                )}
              </div>
            </div>
          </section>

          {/* ================= RIGHT COLUMN: STAFF & PROFILE ================= */}
          <section className="main-content-right">
            <div className="section-card-v2 staff-overview-card">
              <div className="card-header-v2">
                <h2>Operations Team</h2>
              </div>
              <div className="staff-metrics-v2">
                <div className="metric-item-v2">
                  <div className="metric-icon-v2 receptionist">👥</div>
                  <div className="metric-data-v2">
                    <span className="label">Receptionists</span>
                    <span className="value">{stats?.staff?.receptionists || 0}</span>
                  </div>
                </div>
                <div className="metric-item-v2">
                  <div className="metric-icon-v2 biller">💳</div>
                  <div className="metric-data-v2">
                    <span className="label">Billing Team</span>
                    <span className="value">{stats?.staff?.billers || 0}</span>
                  </div>
                </div>
                <div className="metric-item-v2">
                  <div className="metric-icon-v2 admin">🛡️</div>
                  <div className="metric-data-v2">
                    <span className="label">Administrators</span>
                    <span className="value">{stats?.staff?.admins || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hospital-mini-profile-v2">
              <img src={hospitalImg} alt="Hospital" className="profile-bg" />
              <div className="profile-overlay-v2">
                <h3>Sri Lakshmi Hospital</h3>
                <p>📍 Tiruppur, TN</p>
                <div className="profile-tags-v2">
                  <span>24/7 Service</span>
                  <span>Radiology Hub</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}


