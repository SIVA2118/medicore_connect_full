import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/Biller/BillerProfile.css";
import AdminNavbar from "../../components/AdminNavbar";
import BillerIdCard from "../Biller/BillerIdCard";

export default function AdminViewBillerProfile() {
    const { billerId } = useParams();
    const navigate = useNavigate();
    const [biller, setBiller] = useState({
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
    }, [billerId]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`http://localhost:5000/api/admin/biller/${billerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBiller(prev => ({
                ...prev,
                ...res.data,
            }));
        } catch (err) {
            console.error("Failed to fetch biller profile");
            alert("Error fetching biller profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBiller(prev => ({ ...prev, [name]: value }));
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
                await axios.put(`http://localhost:5000/api/admin/biller/${billerId}`,
                    { profileImage: base64Image },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setBiller(prev => ({ ...prev, profileImage: base64Image }));
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
            await axios.put(`http://localhost:5000/api/admin/biller/${billerId}`,
                { profileImage: "" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBiller(prev => ({ ...prev, profileImage: "" }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5000/api/admin/biller/${billerId}`,
                biller,
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

            <div className="biller-profile-container" style={{ paddingTop: '1rem' }}>
                {/* LEFT CARD */}
                <div className="profile-card-left">
                    <div className="avatar-wrapper">
                        {biller.profileImage && (
                            <button className="delete-avatar-btn" onClick={handleDeletePhoto}>🗑️</button>
                        )}
                        {biller.profileImage ? (
                            <img src={biller.profileImage} alt="Profile" className="profile-avatar" />
                        ) : (
                            <div className="avatar-placeholder">
                                {biller.name?.charAt(0) || "B"}
                            </div>
                        )}
                    </div>

                    <h2 className="profile-name">{biller.name}</h2>
                    <p className="profile-role">Billing Officer</p>

                    <label htmlFor="photo-upload" className="upload-btn">Upload Photo</label>
                    <input id="photo-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />

                    <div className="member-since">
                        Member Since: {biller.createdAt ? new Date(biller.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                </div>

                {/* RIGHT CARD */}
                <div className="profile-card-right">
                    <div className="edit-header">
                        <h2>{isEditing ? "Edit Biller Profile (Admin View)" : "Biller Details"}</h2>
                    </div>

                    {!isEditing ? (
                        <div className="view-mode-container">
                            <div className="view-grid">
                                <div className="view-group"><label>Full Name</label><p>{biller.name}</p></div>
                                <div className="view-group"><label>Email</label><p>{biller.email}</p></div>
                                <div className="view-group"><label>Phone</label><p>{biller.phone || "Not Set"}</p></div>
                                <div className="view-group"><label>Employee ID</label><p>{biller.employeeId || "Not Set"}</p></div>
                                <div className="view-group"><label>Blood Group</label><p>{biller.bloodGroup || "Not Set"}</p></div>
                                <div className="view-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Emergency Contact</label>
                                    <p>{biller.emergencyContactName} {biller.emergencyContactPhone ? `(${biller.emergencyContactPhone})` : ""}</p>
                                </div>
                                <div className="view-group">
                                    <label>Degree</label>
                                    <p>{biller.degree || "Not Set"}</p>
                                </div>
                                <div className="view-group">
                                    <label>Address</label>
                                    <p>{biller.address || "Not Set"}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="update-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                <button className="update-btn" onClick={() => setShowIdCard(true)} style={{ background: '#1a2c4e' }}>🆔 View ID Card</button>
                            </div>
                        </div>
                    ) : (
                        <div className="tab-content">
                            <div className="form-grid">
                                <div className="form-group"><label className="form-label">Full Name</label><input type="text" name="name" value={biller.name} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label className="form-label">Phone</label><input type="text" name="phone" value={biller.phone} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label className="form-label">Employee ID</label><input type="text" name="employeeId" value={biller.employeeId} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group">
                                    <label className="form-label">Blood Group</label>
                                    <select name="bloodGroup" value={biller.bloodGroup} onChange={handleInputChange} className="form-input">
                                        <option value="">Select</option>
                                        <option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                                        <option value="A-">A-</option><option value="O-">O-</option><option value="B-">B-</option><option value="AB-">AB-</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="form-label">Emergency Contact Name</label><input type="text" name="emergencyContactName" value={biller.emergencyContactName} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label className="form-label">Emergency Contact Phone</label><input type="text" name="emergencyContactPhone" value={biller.emergencyContactPhone} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label className="form-label">Degree</label><input type="text" name="degree" value={biller.degree} onChange={handleInputChange} className="form-input" placeholder="e.g. B.Com" /></div>
                                <div className="form-group"><label className="form-label">Address</label><input type="text" name="address" value={biller.address} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group"><label className="form-label">Email Address</label><input type="email" name="email" value={biller.email} onChange={handleInputChange} className="form-input" /></div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={biller.password || ""}
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
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button className="update-btn" onClick={handleSubmit}>Save Changes</button>
                                <button className="update-btn" style={{ background: '#64748b' }} onClick={() => setIsEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showIdCard && (
                <BillerIdCard biller={biller} onClose={() => setShowIdCard(false)} />
            )}
        </>
    );
}
