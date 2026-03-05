import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/ScannersPage.css";
import { useNavigate } from "react-router-dom";

export default function ScannersPage() {
  const navigate = useNavigate();
  const [scanners, setScanners] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch scanners
  const fetchScanners = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/all-users?role=scanner",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setScanners(res.data.scanners || []);
    } catch (err) {
      alert("Failed to load scanners");
    }
  };

  useEffect(() => {
    fetchScanners();
  }, []);

  // 🔹 Create scanner
  const createScanner = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/admin/create-scanner",
        {
          name,
          email,
          password,
          department,
          employeeId,
          bloodGroup,
          emergencyContactName,
          emergencyContactPhone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Scanner created successfully");
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      setDepartment("");
      fetchScanners();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create scanner");
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        {/* ================= HEADER ================= */}
        <div className="page-header">
          <h1>Scanners</h1>
          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Scanner
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Dept</th>
                <th>Blood Group</th>
              </tr>
            </thead>
            <tbody>
              {scanners.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No scanners found
                  </td>
                </tr>
              ) : (
                scanners.map((scanner) => (
                  <tr
                    key={scanner._id}
                    onClick={() => navigate(`/admin/scanner/${scanner._id}`)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>{scanner.employeeId}</td>
                    <td>{scanner.name}</td>
                    <td>{scanner.email}</td>
                    <td>{scanner.department}</td>
                    <td>{scanner.bloodGroup}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Create Scanner</h2>

            <form onSubmit={createScanner}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />

              <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>ID Card Details</h4>
              <input
                placeholder="Employee ID (SCN-01)"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
              <input
                placeholder="Emergency Contact Name"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
              <input
                placeholder="Emergency Contact Phone"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
