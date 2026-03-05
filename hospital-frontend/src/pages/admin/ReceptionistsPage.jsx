import { useEffect, useState } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/ReceptionistsPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ReceptionistsPage() {
  const navigate = useNavigate();
  const [receptionists, setReceptionists] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const token = localStorage.getItem("token");

  // 🔹 Fetch receptionists
  const fetchReceptionists = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/all-users?role=receptionist",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReceptionists(res.data.receptionists || []);
    } catch (err) {
      alert("Failed to load receptionists");
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  // 🔹 Create receptionist
  const createReceptionist = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/admin/create-receptionist",
        {
          name,
          email,
          password,
          employeeId,
          bloodGroup,
          emergencyContactName,
          emergencyContactPhone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setName("");
      setEmail("");
      setPassword("");
      setShowModal(false);
      fetchReceptionists();
      alert("Receptionist created successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Creation failed");
    }
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        {/* HEADER */}
        <div className="page-header">
          <h1>Receptionists</h1>
          <button className="create-btn" onClick={() => setShowModal(true)}>
            + Create
          </button>
        </div>

        {/* TABLE */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Blood Group</th>
              </tr>
            </thead>

            <tbody>
              {receptionists.map((r) => (
                <tr
                  key={r._id}
                  onClick={() => navigate(`/admin/receptionist/${r._id}`)}
                  style={{ cursor: 'pointer' }}
                  className="clickable-row"
                >
                  <td>{r.employeeId}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.bloodGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={createReceptionist}>
            <h3>Add Receptionist</h3>

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <h4 style={{ marginTop: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>ID Card Details</h4>
            <input
              placeholder="Employee ID (REC-01)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
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
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
