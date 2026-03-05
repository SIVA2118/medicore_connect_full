import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/ReportsPage.css";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("clinical"); // 'patients' or 'clinical'
  const [patients, setPatients] = useState([]);
  const [clinicalReports, setClinicalReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [pRes, cRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/patients", { headers }),
          axios.get("http://localhost:5000/api/admin/clinical-reports", { headers })
        ]);

        setPatients(pRes.data.patients || []);
        setClinicalReports(cRes.data.reports || []);
      } catch (err) {
        console.error("Failed to load reports data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredReports = clinicalReports.filter(r =>
    (filterType === "ALL" || r.reportType === filterType) &&
    (r.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Syncing Clinical Data...</p>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="reports-page-v2">
        <header className="reports-header">
          <div className="header-base">
            <span className="badge-v2">ANALYTICS V2.0</span>
            <h1>Clinical Repository</h1>
            <p>Comprehensive patient history and filed diagnostic reports</p>
          </div>
        </header>

        {/* ================= TABS ================= */}
        <nav className="reports-nav">
          <button
            className={`nav-item ${activeTab === 'clinical' ? 'active' : ''}`}
            onClick={() => setActiveTab('clinical')}
          >
            📂 Filed Reports
            <span className="count-badge">{clinicalReports.length}</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            👥 Patient Records
            <span className="count-badge">{patients.length}</span>
          </button>
        </nav>

        {/* ================= FILTERS & SEARCH ================= */}
        <div className="controls-row">
          <div className="search-box-v2">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={activeTab === 'clinical' ? "Search reports, patients, titles..." : "Search patients by name or MRN..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {activeTab === 'clinical' && (
            <div className="filter-chips">
              <button className={filterType === 'ALL' ? 'active' : ''} onClick={() => setFilterType('ALL')}>All</button>
              <button className={filterType === 'Scan' ? 'active' : ''} onClick={() => setFilterType('Scan')}>Scans</button>
              <button className={filterType === 'Clinical' ? 'active' : ''} onClick={() => setFilterType('Clinical')}>Manual</button>
            </div>
          )}
        </div>

        <main className="reports-content-v2">
          {activeTab === 'clinical' ? (
            /* ================= CLINICAL REPORTS GRID ================= */
            <div className="reports-grid-v2">
              {filteredReports.map((report, idx) => (
                <div className="report-card-v2" key={report._id} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="report-card-header">
                    <span className={`type-tag ${report.reportType.toLowerCase()}`}>
                      {report.reportType}
                    </span>
                    <span className="report-date">{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="report-title">{report.title}</h3>
                  <div className="patient-mini-card">
                    <Link to={`/admin/patient/${report.patient?._id}`} className="p-avatar" style={{ textDecoration: 'none' }}>
                      {report.patient?.name?.charAt(0)}
                    </Link>
                    <div className="p-info">
                      <p className="p-name">{report.patient?.name}</p>
                      <p className="p-mrn">{report.patient?.mrn}</p>
                    </div>
                  </div>
                  <div className="report-footer">
                    <div className="doctor-tag">Dr. {report.doctor?.name}</div>
                    <button className="view-btn-v2" onClick={() => {
                      if (report.reportType === "Scan") navigate(`/scanner/scan-report/view/${report._id}`);
                      else navigate(`/doctor/report/view/${report._id}`);
                    }}>View</button>
                  </div>
                  <div className="card-glass-shine"></div>
                </div>
              ))}
              {filteredReports.length === 0 && <p className="no-data-v2">No clinical reports found matching your search.</p>}
            </div>
          ) : (
            /* ================= PATIENT RECORDS VIEW ================= */
            <div className="patients-table-v2">
              <div className="table-header-v2">
                <span>Patient Name</span>
                <span>MRN</span>
                <span>Type</span>
                <span>Primary Doctor</span>
                <span>Last Registration</span>
                <span>Actions</span>
              </div>
              {filteredPatients.map((p, idx) => (
                <div className="table-row-v2" key={p._id} style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="p-cell-name">
                    <Link to={`/admin/patient/${p._id}`} className="p-avatar-sm" style={{ textDecoration: 'none' }}>
                      {p.name?.charAt(0)}
                    </Link>
                    <span>{p.name}</span>
                  </div>
                  <div className="p-cell-mrn"><span className="mrn-badge">{p.mrn || "N/A"}</span></div>
                  <div className="p-cell-type"><span className={`type-pill ${p.patientType?.toLowerCase()}`}>{p.patientType}</span></div>
                  <div className="p-cell-doctor">{p.assignedDoctor?.name || "Unassigned"}</div>
                  <div className="p-cell-date">{new Date(p.createdAt).toLocaleDateString()}</div>
                  <div className="p-cell-actions">
                    <button className="action-btn-icon" title="View Patient Profile" onClick={() => navigate(`/admin/patient/${p._id}`)}>👤</button>
                    <button className="action-btn-icon" title="View All Reports">📁</button>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && <p className="no-data-v2">No patient records found.</p>}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
