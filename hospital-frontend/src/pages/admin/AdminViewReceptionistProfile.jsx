import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Receptionist/ReceptionistProfile.css";
import AdminNavbar from "../../components/AdminNavbar";
import ReceptionistIdCard from "../Receptionist/ReceptionistIdCard";

export default function AdminViewReceptionistProfile() {
    const { receptionistId } = useParams();
    const navigate = useNavigate();
    const [receptionist, setReceptionist] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        degree: "",
        username: "",
        password: "",
        facebook: "",
        twitter: "",
        profileImage: "",
        bloodGroup: "",
        employeeId: "",
        emergencyContactName: "",
        emergencyContactPhone: ""
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [showIdCard, setShowIdCard] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [receptionistId]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            // Using admin endpoint to fetch user by ID with role receptionist
            const res = await axios.get(`http://localhost:5000/api/admin/receptionist/${receptionistId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReceptionist(prev => ({
                ...prev,
                ...res.data,
            }));
        } catch (err) {
            console.error("Failed to fetch receptionist profile");
            alert("Error fetching receptionist profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReceptionist(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) {
            alert("File size exceeds 1MB");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Image = reader.result;
            try {
                const token = localStorage.getItem("token");
                await axios.put(`http://localhost:5000/api/admin/receptionist/${receptionistId}`,
                    { profileImage: base64Image },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReceptionist(prev => ({ ...prev, profileImage: base64Image }));
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
            await axios.put(`http://localhost:5000/api/admin/receptionist/${receptionistId}`,
                { profileImage: "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReceptionist(prev => ({ ...prev, profileImage: "" }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/admin/receptionist/${receptionistId}`,
                receptionist,
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
        <>
            <AdminNavbar />
            <div style={{ padding: '1rem 3rem 0' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        width: '40px',
                        height: '40px',
                        background: '#1a2c4e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    title="Back to List"
                >
                    ←
                </button>
            </div>

            <div className="receptionist-profile-container" style={{ paddingTop: '1rem' }}>
                {/* LEFT CARD */}
                <div className="profile-card-left">
                    <div className="avatar-wrapper">
                        {receptionist.profileImage && (
                            <button className="delete-avatar-btn" onClick={handleDeletePhoto} title="Remove Photo">
                                🗑️
                            </button>
                        )}
                        {receptionist.profileImage ? (
                            <img src={receptionist.profileImage} alt="Profile" className="profile-avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                {receptionist.name?.charAt(0) || "U"}
                            </div>
                        )}
                    </div>

                    <h2 className="profile-name">{receptionist.name}</h2>
                    <p className="profile-role">@{receptionist.username || "username"}</p>

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
                        Upload a new avatar. Larger image will be resized automatically.<br />
                        Maximum upload size is <strong>1 MB</strong>
                    </p>

                    <div className="member-since">
                        Member Since: {receptionist.createdAt ? new Date(receptionist.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                    </div>
                </div>

                {/* RIGHT CARD */}
                <div className="profile-card-right">
                    <div className="edit-header">
                        <h2>{isEditing ? "Edit Profile (Admin View)" : "Receptionist Profile Details"}</h2>
                    </div>

                    {!isEditing ? (
                        <div className="view-mode-container">
                            <div className="view-grid">
                                <div className="view-group">
                                    <label>Full Name</label>
                                    <p>{receptionist.name}</p>
                                </div>
                                <div className="view-group">
                                    <label>Username</label>
                                    <p>{receptionist.username}</p>
                                </div>
                                <div className="view-group">
                                    <label>Phone Number</label>
                                    <p>{receptionist.phone || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Degree</label>
                                    <p>{receptionist.degree || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Address</label>
                                    <p>{receptionist.address || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Email Address</label>
                                    <p>{receptionist.email}</p>
                                </div>
                                <div className="view-group">
                                    <label>Employee ID</label>
                                    <p>{receptionist.employeeId || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Blood Group</label>
                                    <p>{receptionist.bloodGroup || "Not Set"}</p>
                                </div>
                                <div className="view-group full-width">
                                    <label>Emergency Contact</label>
                                    <p>
                                        {receptionist.emergencyContactName || "Name Not Set"}
                                        {receptionist.emergencyContactPhone ? ` (${receptionist.emergencyContactPhone})` : ""}
                                    </p>
                                </div>
                            </div>

                            <div className="button-group" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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
                                        value={receptionist.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={receptionist.username}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={receptionist.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Degree</label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={receptionist.degree}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={receptionist.address}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={receptionist.bloodGroup}
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
                                        value={receptionist.emergencyContactName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Emergency Contact Phone</label>
                                    <input
                                        type="text"
                                        name="emergencyContactPhone"
                                        value={receptionist.emergencyContactPhone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={receptionist.email}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password (leave blank to keep current)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={receptionist.password || ""}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Leave blank to keep current"
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
                                    <label className="form-label">Employee ID</label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={receptionist.employeeId}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="button-group" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="update-btn" onClick={handleSubmit}>Save Changes</button>
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
                <ReceptionistIdCard
                    receptionist={receptionist}
                    onClose={() => setShowIdCard(false)}
                />
            )}
        </>
    );
}
