import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Doctor/DoctorProfile.css";
import DoctorNavbar from "../../components/DoctorNavbar";
import DoctorIdCard from "./DoctorIdCard";

export default function DoctorProfile() {
    const [doctor, setDoctor] = useState({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        registrationNumber: "",
        profileImage: "",
        bloodGroup: "",
        employeeId: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        experience: 0,
        qualification: "",
        clinicAddress: "",
        consultationFee: 0,
        age: 0,
        gender: "Male",
        bio: "",
        degree: "",
        address: ""
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
            const res = await axios.get("http://localhost:5000/api/doctor/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Pre-fill state with fetched data
            setDoctor(prev => ({
                ...prev,
                ...res.data,
                employeeId: res.data.employeeId || "DOC-01",
            }));
        } catch (err) {
            console.error("Failed to fetch profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDoctor(prev => ({ ...prev, [name]: value }));
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
                await axios.put("http://localhost:5000/api/doctor/profile",
                    { profileImage: base64Image },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setDoctor(prev => ({ ...prev, profileImage: base64Image }));
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
            await axios.put("http://localhost:5000/api/doctor/profile",
                { profileImage: "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDoctor(prev => ({ ...prev, profileImage: "" }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/doctor/profile",
                doctor,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert("Failed to update profile info");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <>
            <DoctorNavbar />
            <div className="doctor-profile-container">

                {/* LEFT CARD */}
                <div className="profile-card-left">
                    <div className="avatar-wrapper">
                        {doctor.profileImage && (
                            <button className="delete-avatar-btn" onClick={handleDeletePhoto} title="Remove Photo">
                                🗑️
                            </button>
                        )}
                        {doctor.profileImage ? (
                            <img src={doctor.profileImage} alt="Profile" className="profile-avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                {doctor.name?.charAt(0) || "D"}
                            </div>
                        )}
                    </div>

                    <h2 className="profile-name">{doctor.name}</h2>
                    <p className="profile-role">{doctor.specialization || "Doctor"}</p>

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
                        Member Since: {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
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
                                    <p>{doctor.name}</p>
                                </div>
                                <div className="view-group">
                                    <label>Specialization</label>
                                    <p>{doctor.specialization || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Registration Number</label>
                                    <p>{doctor.registrationNumber || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Qualification</label>
                                    <p>{doctor.qualification || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Phone Number</label>
                                    <p>{doctor.phone || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Email Address</label>
                                    <p>{doctor.email}</p>
                                </div>
                                <div className="view-group">
                                    <label>Experience (Years)</label>
                                    <p>{doctor.experience || 0}</p>
                                </div>
                                <div className="view-group">
                                    <label>Consultation Fee</label>
                                    <p>₹{doctor.consultationFee || 0}</p>
                                </div>
                                <div className="view-group">
                                    <label>Employee ID</label>
                                    <p>{doctor.employeeId || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Blood Group</label>
                                    <p>{doctor.bloodGroup || "Not Set"}</p>
                                </div>
                                <div className="view-group full-width" style={{ gridColumn: 'span 2' }}>
                                    <label>Emergency Contact</label>
                                    <p>
                                        {doctor.emergencyContactName || "Name Not Set"}
                                        {doctor.emergencyContactPhone ? ` (${doctor.emergencyContactPhone})` : ""}
                                    </p>
                                </div>
                                <div className="view-group full-width" style={{ gridColumn: 'span 2' }}>
                                    <label>Clinic Address</label>
                                    <p>{doctor.clinicAddress || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Degree</label>
                                    <p>{doctor.degree || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Address</label>
                                    <p>{doctor.address || "Not Set"}</p>
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
                                        value={doctor.name}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Specialization</label>
                                    <input
                                        type="text"
                                        name="specialization"
                                        value={doctor.specialization}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={doctor.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Qualification</label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={doctor.qualification}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g. MBBS, MD"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Registration Number</label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={doctor.registrationNumber}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Experience (Years)</label>
                                    <input
                                        type="number"
                                        name="experience"
                                        value={doctor.experience}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Consultation Fee</label>
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={doctor.consultationFee}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Clinic Address</label>
                                    <input
                                        type="text"
                                        name="clinicAddress"
                                        value={doctor.clinicAddress}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                {/* ID Card Fields */}
                                <h3 className="section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>ID Card Details</h3>

                                <div className="form-group">
                                    <label className="form-label">Employee ID (Read-only)</label>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={doctor.employeeId}
                                        readOnly
                                        className="form-input read-only"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={doctor.bloodGroup}
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
                                        value={doctor.emergencyContactName}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Emergency Contact Phone</label>
                                    <input
                                        type="text"
                                        name="emergencyContactPhone"
                                        value={doctor.emergencyContactPhone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Degree</label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={doctor.degree}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g. MS, MCH"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={doctor.address}
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
                <DoctorIdCard
                    doctor={doctor}
                    onClose={() => setShowIdCard(false)}
                />
            )}
        </>
    );
}
