import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Doctor/Profile.css";

export default function Profile() {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/doctor/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctor(res.data);
        } catch (err) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/doctor/update-password", passwords, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Password updated successfully");
            setPasswords({ oldPassword: "", newPassword: "" });
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update password");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2 style={{ marginBottom: "2rem", color: "var(--primary-800)" }}>My Profile</h2>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Name</label>
                        <input value={doctor?.name} disabled />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input value={doctor?.email} disabled />
                    </div>
                    <div className="form-group">
                        <label>Specialization</label>
                        <input value={doctor?.specialization} disabled />
                    </div>
                </div>

                <h3 className="section-title">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="form-grid">
                    <div className="form-group">
                        <label>Old Password</label>
                        <input
                            type="password"
                            value={passwords.oldPassword}
                            onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        />
                    </div>
                    <button className="btn-primary" style={{ height: "fit-content", alignSelf: "end" }}>Update</button>
                </form>
            </div>
        </div>
    );
}
