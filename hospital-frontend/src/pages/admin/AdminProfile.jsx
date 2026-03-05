import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/admin/AdminProfile.css";
import AdminNavbar from "../../components/AdminNavbar";
import AdminIdCard from "./AdminIdCard";

export default function AdminProfile() {
    const [admin, setAdmin] = useState({
        name: "",
        email: "",
        phone: "",
        profileImage: "",
        bloodGroup: "",
        employeeId: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        degree: "",
        address: ""
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showIdCard, setShowIdCard] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/admin/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdmin(prev => ({
                ...prev,
                ...res.data,
                employeeId: res.data.employeeId || "ADM-01",
            }));
        } catch (err) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdmin(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Image = reader.result;
            try {
                const token = localStorage.getItem("token");
                await axios.put("http://localhost:5000/api/admin/profile",
                    { profileImage: base64Image },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setAdmin(prev => ({ ...prev, profileImage: base64Image }));
                alert("Profile photo updated!");
            } catch (err) {
                console.error(err);
                alert("Failed to update photo");
            }
        };
    };

    const handleDeletePhoto = async () => {
        if (!window.confirm("Remove profile photo?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/admin/profile",
                { profileImage: "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAdmin(prev => ({ ...prev, profileImage: "" }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/admin/profile",
                admin,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update profile info");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="admin-page-wrapper">
            <AdminNavbar />
            <main className="admin-dashboard">
                <div className="admin-profile-container">

                    {/* LEFT CARD */}
                    <div className="profile-card-left">
                        <div className="avatar-wrapper">
                            {admin.profileImage && (
                                <button className="delete-avatar-btn" onClick={handleDeletePhoto} title="Remove Photo">
                                    🗑️
                                </button>
                            )}
                            {admin.profileImage ? (
                                <img src={admin.profileImage} alt="Profile" className="profile-avatar" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {admin.name?.charAt(0) || "A"}
                                </div>
                            )}
                        </div>

                        <h2 className="profile-name">{admin.name}</h2>
                        <p className="profile-role">Administrator</p>

                        <label htmlFor="photo-upload" className="upload-btn">
                            Upload New Photo
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: "none" }}
                        />

                        <p className="image-help-text">
                            Upload a new avatar.<br />
                            Maximum upload size is <strong>1 MB</strong>
                        </p>

                        <div className="member-since">
                            Member Since: {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <div className="profile-card-right">
                        <div className="edit-header">
                            <h2>{isEditing ? "Edit Profile" : "Profile Details"}</h2>
                        </div>

                        {!isEditing ? (
                            <div className="view-mode-container">
                                <div className="view-grid">
                                    <div className="view-group">
                                        <label>Full Name</label>
                                        <p>{admin.name}</p>
                                    </div>
                                    <div className="view-group">
                                        <label>Email Address</label>
                                        <p>{admin.email}</p>
                                    </div>
                                    <div className="view-group">
                                        <label>Phone Number</label>
                                        <p>{admin.phone || "Not Set"}</p>
                                    </div>
                                    <div className="view-group">
                                        <label>Employee ID</label>
                                        <p>{admin.employeeId || "Not Set"}</p>
                                    </div>
                                    <div className="view-group">
                                        <label>Blood Group</label>
                                        <p>{admin.bloodGroup || "Not Set"}</p>
                                    </div>
                                    <div className="view-group full-width" style={{ gridColumn: 'span 2' }}>
                                        <label>Emergency Contact</label>
                                        <p>
                                            {admin.emergencyContactName || "Name Not Set"}
                                            {admin.emergencyContactPhone ? ` (${admin.emergencyContactPhone})` : ""}
                                        </p>
                                    </div>
                                    <div className="view-group">
                                        <label>Degree</label>
                                        <p>{admin.degree || "Not Set"}</p>
                                    </div>
                                    <div className="view-group">
                                        <label>Address</label>
                                        <p>{admin.address || "Not Set"}</p>
                                    </div>
                                </div>

                                <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="update-btn" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </button>
                                    <button
                                        className="update-btn"
                                        onClick={() => setShowIdCard(true)}
                                        style={{ background: '#1a2c4e' }}
                                    >
                                        🆔 View ID Card
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="tab-content">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={admin.name}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={admin.phone}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={admin.email}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Old Password</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="oldPassword"
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter old password to verify"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                {showPassword ? "👁️" : "🙈"}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">New Password (leave blank to keep current)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                {showPassword ? "👁️" : "🙈"}
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>ID Card Details</h3>

                                    <div className="form-group">
                                        <label className="form-label">Employee ID (Read-only)</label>
                                        <input
                                            type="text"
                                            name="employeeId"
                                            value={admin.employeeId}
                                            readOnly
                                            className="form-input read-only"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Blood Group</label>
                                        <select
                                            name="bloodGroup"
                                            value={admin.bloodGroup}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        >
                                            <option value="">Select Group</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Emergency Contact Name</label>
                                        <input
                                            type="text"
                                            name="emergencyContactName"
                                            value={admin.emergencyContactName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Emergency Contact Phone</label>
                                        <input
                                            type="text"
                                            name="emergencyContactPhone"
                                            value={admin.emergencyContactPhone}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Degree</label>
                                        <input
                                            type="text"
                                            name="degree"
                                            value={admin.degree}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="e.g. MBA, PhD"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={admin.address}
                                            onChange={handleInputChange}
                                            className="form-input"
                                        />
                                    </div>
                                </div>

                                <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                                    <button className="update-btn" onClick={handleSubmit}>Update info</button>
                                    <button
                                        className="update-btn"
                                        style={{ background: '#64748b' }}
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {showIdCard && (
                    <AdminIdCard
                        admin={admin}
                        onClose={() => setShowIdCard(false)}
                    />
                )}
            </main>
        </div>
    );
}
