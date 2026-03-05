import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Receptionist/AssignedDoctors.css";
import ReceptionistNavbar from "../../components/ReceptionistNavbar";

export default function AssignedDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/receptionist/all-doctors", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setDoctors(res.data.doctors);
            }
        } catch (err) {
            console.error("Failed to fetch doctors", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ReceptionistNavbar />
            <div className="doctors-list-container">
                <h2>Available Doctors</h2>
                {loading ? (
                    <p>Loading doctors...</p>
                ) : (
                    <div className="doctors-grid">
                        {doctors.map((doc) => (
                            <div className="doctor-card" key={doc._id}>
                                {doc.profileImage ? (
                                    <img src={doc.profileImage} alt={doc.name} className="doctor-profile-img" />
                                ) : (
                                    <div className="doctor-avatar">👨‍⚕️</div>
                                )}
                                <h3>{doc.name}</h3>
                                <p className="specialization">{doc.specialization}</p>
                                <p>Email: {doc.email}</p>
                                <p>Phone: {doc.phone || "N/A"}</p>
                                {doc.availability?.days?.length > 0 ? (
                                    <div className="availability-info">
                                        <p><strong>Available:</strong> {doc.availability.days.join(", ")}</p>
                                        <p><strong>Time:</strong> {doc.availability.from} - {doc.availability.to}</p>
                                    </div>
                                ) : (
                                    <p className="no-availability">Availability Not Set</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
