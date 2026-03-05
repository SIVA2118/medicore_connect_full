import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ScannerNavbar from "../../components/ScannerNavbar";
import "../../styles/dashboards/ScannerDashboard.css";

export default function ScannerDashboard() {
  const [stats, setStats] = useState({
    totalScans: 0,
    completedScans: 0,
    todayScans: 0,
    myTotalScans: 0,
    breakdown: []
  });
  const [recentScans, setRecentScans] = useState([]);
  const [myPendingScans, setMyPendingScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/scanner/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStats(res.data.stats || {
            totalScans: 0,
            completedScans: 0,
            todayScans: 0,
            myTotalScans: 0,
            breakdown: []
          });
          setRecentScans(res.data.recentScans || []);
          setMyPendingScans(res.data.myPendingScans || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Critical': return '🔴';
      case 'Abnormal': return '🟡';
      case 'Normal': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) return <div className="loading-screen">Loading Scanner Dashboard...</div>;

  return (
    <>
      <ScannerNavbar />
      <div className="dashboard-container">
        <header className="dashboard-header animate-fade-in">
          <div className="header-info">
            <h1>Scanner Insights</h1>
            <p>Real-time laboratory & imaging metrics</p>
          </div>
          <div className="header-actions">
            <Link to="/scanner/create-report" className="btn-primary-glow">
              + New Scan Entry
            </Link>
          </div>
        </header>

        {/* TOP METRICS GLASS CARDS */}
        <div className="stats-grid animate-fade-in">
          <div className="stat-card glass blue">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <h3>Today's Scans</h3>
              <p className="stat-value">{stats.todayScans}</p>
              <span className="stat-label">Total processed today</span>
            </div>
          </div>
          <div className="stat-card glass orange">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Assigned to Me</h3>
              <p className="stat-value">{myPendingScans.length}</p>
              <span className="stat-label">Pending your action</span>
            </div>
          </div>
          <div className="stat-card glass green">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p className="stat-value">{stats.completedScans}</p>
              <span className="stat-label">Verified global reports</span>
            </div>
          </div>
          <div className="stat-card glass purple">
            <div className="stat-icon">🏥</div>
            <div className="stat-content">
              <h3>Lifetime Scans</h3>
              <p className="stat-value">{stats.totalScans}</p>
              <span className="stat-label">System total</span>
            </div>
          </div>
        </div>

        <div className="dashboard-main-content">
          {/* LEFT: PENDING ACTIONS */}
          <div className="content-left">
            <div className="section-header">
              <h2>📥 Priority Assignments</h2>
              <span className="badge-count">{myPendingScans.length} Tasks</span>
            </div>

            {myPendingScans.length === 0 ? (
              <div className="empty-state">
                <p>All clear! No pending assignments.</p>
              </div>
            ) : (
              <div className="actionable-cards">
                {myPendingScans.map(scan => (
                  <div key={scan._id} className="action-card-premium">
                    <div className="card-top">
                      <span className="type-tag">{scan.type}</span>
                      <span className="date-tag">{new Date(scan.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="card-mid">
                      <h3>{scan.patient?.name}</h3>
                      <p className="patient-meta">ID: {scan.patient?.mrn} • {scan.patient?.age}Y • {scan.patient?.gender}</p>
                      <p className="scan-purpose"><strong>Scan:</strong> {scan.scanName}</p>
                    </div>
                    <div className="card-bottom">
                      <span className="requesting-doc">Dr. {scan.doctor?.name || 'Assigned'}</span>
                      <Link to={`/scanner/reports`} className="btn-action-mini">Process →</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: RECENT ACTIVITY & TRENDS */}
          <div className="content-right">
            <div className="activity-card glass">
              <div className="section-header">
                <h2>📊 Distribution</h2>
              </div>
              <div className="distribution-list">
                {stats.breakdown.length > 0 ? stats.breakdown.map((item, idx) => (
                  <div key={idx} className="dist-item">
                    <span className="dist-label">{getStatusIcon(item._id)} {item._id}</span>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${item._id?.toLowerCase()}`}
                        style={{ width: `${stats.totalScans > 0 ? (item.count / stats.totalScans) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="dist-value">{item.count}</span>
                  </div>
                )) : <p className="no-data">No data available</p>}
              </div>

              <div className="section-header" style={{ marginTop: '2rem' }}>
                <h2>🕒 Recent Updates</h2>
              </div>
              <div className="activity-list">
                {recentScans.map(scan => (
                  <Link key={scan._id} to={`/scanner/scan-report/view/${scan._id}`} className="activity-item-link">
                    <div className="activity-item">
                      <div className="activity-icon">{getStatusIcon(scan.resultStatus)}</div>
                      <div className="activity-info">
                        <p><strong>{scan.patient?.name}</strong> - {scan.scanName}</p>
                        <span>{new Date(scan.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by Dr. {scan.doctor?.name || 'Scanner'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
