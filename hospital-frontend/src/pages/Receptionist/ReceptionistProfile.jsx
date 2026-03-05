import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Receptionist/ReceptionistProfile.css"; // New CSS
import ReceptionistNavbar from "../../components/ReceptionistNavbar";
import ReceptionistIdCard from "./ReceptionistIdCard";

export default function ReceptionistProfile() {
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/receptionist/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Pre-fill state with fetched data
            setReceptionist(prev => ({
                ...prev,
                ...res.data,
                employeeId: res.data.employeeId || "REC-01", // Default to REC-01
                // Username now comes from DB
            }));
        } catch (err) {
            console.error("Failed to fetch profile");
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
                await axios.put("http://localhost:5000/api/receptionist/profile",
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
        // Send empty string or null to remove
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/receptionist/profile",
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
            // Only send relevant fields to backend for now
            const updateData = {
                name: receptionist.name,
                username: receptionist.username,
                email: receptionist.email,
                phone: receptionist.phone,
                address: receptionist.address,
                degree: receptionist.degree,
                facebook: receptionist.facebook,
                twitter: receptionist.twitter,
                twitter: receptionist.twitter,
                bloodGroup: receptionist.bloodGroup,
                employeeId: receptionist.employeeId,
                emergencyContactName: receptionist.emergencyContactName,
                emergencyContactPhone: receptionist.emergencyContactPhone,
                // Add logic for password update if backend supports it
            };

            await axios.put("http://localhost:5000/api/receptionist/profile",
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profile info updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update profile info");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <>
            <ReceptionistNavbar />
            <div className="receptionist-profile-container">

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
                        <h2>{isEditing ? "Edit Profile" : "Profile Details"}</h2>
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
                                {/* New ID Card Fields View */}
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



                            <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                                <button className="update-btn" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </button>
                                <button
                                    className="update-btn"
                                    onClick={() => setShowIdCard(true)}
                                    style={{ background: '#1a2c4e' }} // Navy Blue to match ID card theme
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
                                        placeholder="e.g. B.Com, MBA"
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

                                {/* New ID Card Fields Inputs */}
                                <h3 className="section-title full-width" style={{ marginTop: '1rem', width: '100%', gridColumn: 'span 2' }}>ID Card Details</h3>

                                <div className="form-group">
                                    <label className="form-label">Employee ID (e.g. REC-01)</label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={receptionist.employeeId}
                                        readOnly
                                        className="form-input read-only"
                                        placeholder="REC-01"
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
                                        readOnly
                                        className="form-input read-only"
                                    />
                                </div>
                            </div>

                            <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                                <button className="update-btn" onClick={handleSubmit}>Update info</button>
                                <button
                                    className="update-btn"
                                    style={{ background: '#64748b' }} // Gray for cancel
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
