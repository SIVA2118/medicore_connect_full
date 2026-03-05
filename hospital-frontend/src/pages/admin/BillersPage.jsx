import { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/BillersPage.css";
import { useNavigate } from "react-router-dom";

export default function BillersPage() {
  const navigate = useNavigate();
  const [billers, setBillers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch billers
  const fetchBillers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/all-users?role=biller",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBillers(res.data.billers || []);
    } catch (err) {
      alert("Failed to load billers");
    }
  };

  useEffect(() => {
    fetchBillers();
  }, []);

  // 🔹 Create biller
  const createBiller = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/admin/create-biller",
        {
          name,
          email,
          password,
          employeeId,
          bloodGroup,
          emergencyContactName,
          emergencyContactPhone
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Biller created successfully");
      setShowModal(false);
      setName("");
      setEmail("");
      setPassword("");
      fetchBillers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create biller");
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        {/* ================= HEADER ================= */}
        <div className="page-header">
          <h1>Billers</h1>
          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Biller
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
                <th>Blood Group</th>
              </tr>
            </thead>
            <tbody>
              {billers.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No billers found
                  </td>
                </tr>
              ) : (
                billers.map((biller) => (
                  <tr
                    key={biller._id}
                    onClick={() => navigate(`/admin/biller/${biller._id}`)}
                    style={{ cursor: 'pointer' }}
                    className="clickable-row"
                  >
                    <td>{biller.employeeId}</td>
                    <td>{biller.name}</td>
                    <td>{biller.email}</td>
                    <td>{biller.bloodGroup}</td>
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
            <h2>Create Biller</h2>

            <form onSubmit={createBiller}>
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

              <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>ID Card Details</h4>
              <input
                placeholder="Employee ID (BIL-01)"
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
