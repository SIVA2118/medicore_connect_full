import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../../components/AdminNavbar";
import "../../styles/admin/DoctorsPage.css";

export default function DoctorsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    phone: "",
    gender: "",
    age: "",
    experience: "",
    qualification: "",
    registrationNumber: "",
    clinicAddress: "",
    consultationFee: "",
    bio: "",
    profileImage: "",
    employeeId: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    availability: { days: [], from: "", to: "" },
  });

  // ================= FETCH DOCTORS =================
  const fetchDoctors = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/admin/all-users?role=doctor",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDoctors(res.data.doctors || []);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ================= HANDLERS =================
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvailability = (e) =>
    setForm({
      ...form,
      availability: {
        ...form.availability,
        [e.target.name]: e.target.value,
      },
    });

  const toggleDay = (day) => {
    const days = form.availability.days.includes(day)
      ? form.availability.days.filter((d) => d !== day)
      : [...form.availability.days, day];

    setForm({ ...form, availability: { ...form.availability, days } });
  };

  // ================= CREATE DOCTOR =================
  const createDoctor = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/admin/create-doctor",
      {
        ...form,
        age: Number(form.age),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Doctor created successfully");
    fetchDoctors();
  };

  return (
    <>
      <AdminNavbar />

      <main className="admin-dashboard">
        <h1>Doctors</h1>

        <div className="page-grid">

          {/* ================= CREATE DOCTOR ================= */}
          <form className="card" onSubmit={createDoctor}>
            <h3>Add Doctor</h3>

            <div className="card-scroll form-grid">
              <input name="name" placeholder="Doctor Name" onChange={handleChange} required />
              <input name="email" placeholder="Email" onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" onChange={handleChange} required />

              <select name="gender" onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>

              <select name="specialization" onChange={handleChange} required>
                <option value="">Select Specialization</option>
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Orthopedics</option>
                <option>Dermatology</option>
                <option>Pediatrics</option>
                <option>General Medicine</option>
              </select>

              <input name="phone" placeholder="Phone" onChange={handleChange} />
              <input name="age" type="number" placeholder="Age" onChange={handleChange} />
              <input name="experience" type="number" placeholder="Experience (Years)" onChange={handleChange} />
              <input name="qualification" placeholder="Qualification" onChange={handleChange} />
              <input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} />
              <input name="clinicAddress" placeholder="Clinic Address" onChange={handleChange} />
              <input name="consultationFee" type="number" placeholder="Consultation Fee" onChange={handleChange} />

              <h4 style={{ gridColumn: 'span 2', marginTop: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>ID Card Details</h4>
              <input name="employeeId" placeholder="Employee ID (e.g. DOC-01)" onChange={handleChange} />
              <select name="bloodGroup" onChange={handleChange}>
                <option value="">Select Blood Group</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
              <input name="emergencyContactName" placeholder="Emergency Contact Name" onChange={handleChange} />
              <input name="emergencyContactPhone" placeholder="Emergency Contact Phone" onChange={handleChange} />

              <input name="profileImage" placeholder="Profile Image URL" onChange={handleChange} />

              <textarea name="bio" placeholder="Doctor Bio" onChange={handleChange}></textarea>

              <div className="availability">
                <strong>Available Days</strong>
                <div className="days">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <label key={d}>
                      <input type="checkbox" onChange={() => toggleDay(d)} /> {d}
                    </label>
                  ))}
                </div>
              </div>

              <input type="time" name="from" onChange={handleAvailability} />
              <input type="time" name="to" onChange={handleAvailability} />

              <button type="submit">Create Doctor</button>
            </div>
          </form>

          {/* ================= DOCTOR LIST ================= */}
          <div className="card">
            <h3>Doctor List</h3>

            <div className="card-scroll">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Blood Group</th>
                      <th>Phone</th>
                      <th>Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((d) => (
                      <tr
                        key={d._id}
                        onClick={() => navigate(`/admin/doctor/${d._id}`)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view profile"
                      >
                        <td>{d.employeeId}</td>
                        <td>{d.name}</td>
                        <td>{d.specialization}</td>
                        <td>{d.bloodGroup}</td>
                        <td>{d.phone}</td>
                        <td>₹{d.consultationFee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
