import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LabNavbar from "../../components/LabNavbar";
import "../../styles/dashboards/ScannerDashboard.css"; // Reuse Scanner styles for now

export default function LabTechnicianDashboard() {
    const [stats, setStats] = useState({
        totalReports: 0,
        completedReports: 0,
        todayReports: 0,
        myTotalReports: 0,
        breakdown: []
    });
    const [recentReports, setRecentReports] = useState([]);
    const [myPendingReports, setMyPendingReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/lab/dashboard-stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setStats(res.data.stats || {
                        totalReports: 0,
                        completedReports: 0,
                        todayReports: 0,
                        myTotalReports: 0,
                        breakdown: []
                    });
                    setRecentReports(res.data.recentReports || []);
                    setMyPendingReports(res.data.myPendingReports || []);
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

    if (loading) return <div className="loading-screen">Loading Lab Dashboard...</div>;

    return (
        <>
            <LabNavbar />
            <div className="dashboard-container">
                <header className="dashboard-header animate-fade-in">
                    <div className="header-info">
                        <h1>Lab Insights</h1>
                        <p>Real-time laboratory metrics</p>
                    </div>
                    <div className="header-actions">
                        <Link to="/lab/create-report" className="btn-primary-glow">
                            + New Lab Entry
                        </Link>
                    </div>
                </header>

                {/* TOP METRICS GLASS CARDS */}
                <div className="stats-grid animate-fade-in">
                    <div className="stat-card glass blue">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>Today's Tests</h3>
                            <p className="stat-value">{stats.todayReports}</p>
                            <span className="stat-label">Total processed today</span>
                        </div>
                    </div>
                    <div className="stat-card glass orange">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <h3>Assigned to Me</h3>
                            <p className="stat-value">{myPendingReports.length}</p>
                            <span className="stat-label">Pending your action</span>
                        </div>
                    </div>
                    <div className="stat-card glass green">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3>Completed</h3>
                            <p className="stat-value">{stats.completedReports}</p>
                            <span className="stat-label">Verified global reports</span>
                        </div>
                    </div>
                    <div className="stat-card glass purple">
                        <div className="stat-icon">🏥</div>
                        <div className="stat-content">
                            <h3>Lifetime Reports</h3>
                            <p className="stat-value">{stats.totalReports}</p>
                            <span className="stat-label">System total</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-main-content">
                    {/* LEFT: PENDING ACTIONS */}
                    <div className="content-left">
                        <div className="section-header">
                            <h2>📥 Priority Assignments</h2>
                            <span className="badge-count">{myPendingReports.length} Tasks</span>
                        </div>

                        {myPendingReports.length === 0 ? (
                            <div className="empty-state">
                                <p>All clear! No pending assignments.</p>
                            </div>
                        ) : (
                            <div className="actionable-cards">
                                {myPendingReports.map(report => (
                                    <div key={report._id} className="action-card-premium">
                                        <div className="card-top">
                                            <span className="type-tag">{report.testType}</span>
                                            <span className="date-tag">{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="card-mid">
                                            <h3>{report.patient?.name}</h3>
                                            <p className="patient-meta">ID: {report.patient?.mrn} • {report.patient?.age}Y • {report.patient?.gender}</p>
                                            <p className="scan-purpose"><strong>Test:</strong> {report.testName}</p>
                                        </div>
                                        <div className="card-bottom">
                                            <span className="requesting-doc">Dr. {report.doctor?.name || 'Assigned'}</span>
                                            <Link to={`/lab/reports`} className="btn-action-mini">Process →</Link>
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
                                                style={{ width: `${stats.totalReports > 0 ? (item.count / stats.totalReports) * 100 : 0}%` }}
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
                                {recentReports.map(report => (
                                    <Link key={report._id} to={`/lab/report/view/${report._id}`} className="activity-item-link">
                                        <div className="activity-item">
                                            <div className="activity-icon">{getStatusIcon(report.resultStatus)}</div>
                                            <div className="activity-info">
                                                <p><strong>{report.patient?.name}</strong> - {report.testName}</p>
                                                <span>{new Date(report.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by Dr. {report.doctor?.name || 'Lab'}</span>
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
