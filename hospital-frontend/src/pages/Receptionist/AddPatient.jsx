import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Receptionist/AddPatient.css";
import ReceptionistNavbar from "../../components/ReceptionistNavbar";

export default function AddPatient() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "Male",
        dob: "",
        phone: "",
        email: "",
        bloodGroup: "",
        allergies: "",
        existingConditions: "",
        currentMedications: "",
        patientType: "OPD",
        assignedDoctor: "",
        // Address
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        // Emergency Contact
        emergencyName: "",
        emergencyRelation: "",
        emergencyPhone: "",
        // IPD Details
        ward: "",
        roomNo: "",
        bedNo: "",
        admissionDate: "",
        dischargeDate: "",
        // OPD Details
        visitCount: 1,
        lastVisitDate: ""
    });

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);

    // Webcam State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [videoStream, setVideoStream] = useState(null);


    useEffect(() => {
        fetchDoctors();

        // CHECK FOR EDIT MODE
        if (location.state && location.state.patient) {
            const p = location.state.patient;
            setIsEditMode(true);
            setEditId(p._id);
            setCapturedImage(p.profileImage);

            // Populate form
            setFormData({
                name: p.name,
                age: p.age,
                gender: p.gender,
                dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : "",
                phone: p.phone,
                email: p.email,
                bloodGroup: p.bloodGroup || "",
                allergies: p.allergies || "",
                existingConditions: p.existingConditions || "",
                currentMedications: p.currentMedications || "",
                patientType: p.patientType,
                assignedDoctor: p.assignedDoctor?._id || p.assignedDoctor || "",

                // Address
                line1: p.address?.line1 || "",
                line2: p.address?.line2 || "",
                city: p.address?.city || "",
                state: p.address?.state || "",
                pincode: p.address?.pincode || "",

                // Emergency Contact
                emergencyName: p.emergencyContact?.name || "",
                emergencyRelation: p.emergencyContact?.relation || "",
                emergencyPhone: p.emergencyContact?.phone || "",

                // IPD Details
                ward: p.ipdDetails?.ward || "",
                roomNo: p.ipdDetails?.roomNo || "",
                bedNo: p.ipdDetails?.bedNo || "",
                admissionDate: p.ipdDetails?.admissionDate ? new Date(p.ipdDetails.admissionDate).toISOString().split('T')[0] : "",
                dischargeDate: p.ipdDetails?.dischargeDate ? new Date(p.ipdDetails.dischargeDate).toISOString().split('T')[0] : "",

                // OPD Details
                visitCount: p.opdDetails?.visitCount || 1,
                lastVisitDate: p.opdDetails?.lastVisitDate ? new Date(p.opdDetails.lastVisitDate).toISOString().split('T')[0] : ""
            });
        }

        return () => {
            stopCamera(); // Cleanup on unmount
        };
    }, [location.state]);

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
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Webcam Functions ---
    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoStream(stream);
            const video = document.getElementById("webcam-video");
            if (video) {
                video.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            setVideoStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        const video = document.getElementById("webcam-video");
        const canvas = document.createElement("canvas");
        if (video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        startCamera();
    };
    // ------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            // Construct payload dynamically based on type
            const ipdDetails = formData.patientType === "IPD" ? {
                ward: formData.ward,
                roomNo: formData.roomNo,
                bedNo: formData.bedNo,
                admissionDate: formData.admissionDate || null,
                dischargeDate: formData.dischargeDate || null
            } : null; // Send null to clear if switching types

            const opdDetails = formData.patientType === "OPD" ? {
                visitCount: formData.visitCount,
                lastVisitDate: formData.lastVisitDate || new Date()
            } : null; // Send null to clear if switching types

            const payload = {
                ...formData,
                profileImage: capturedImage, // Add captured image
                address: {
                    line1: formData.line1,
                    line2: formData.line2,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                },
                emergencyContact: {
                    name: formData.emergencyName,
                    relation: formData.emergencyRelation,
                    phone: formData.emergencyPhone,
                },
                ipdDetails,
                opdDetails
            };

            // Clean up flat fields that shouldn't be sent directly if stricter validation existed, 
            // but for now, sending extra fields usually ignored by backend schemas or handled there.
            // Ideally, we'd remove 'ward', 'roomNo' etc from the root object, but it's safe to send them as noise.

            if (isEditMode) {
                // UPDATE
                await axios.put(`http://localhost:5000/api/receptionist/patient/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Patient Updated Successfully!");
                navigate("/receptionist/patients"); // Redirect back to list
            } else {
                // CREATE
                await axios.post("http://localhost:5000/api/receptionist/create-patient", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                alert("Patient Registered Successfully!");
                // Reset form
                setFormData({
                    name: "", age: "", gender: "Male", dob: "", phone: "", email: "",
                    bloodGroup: "", allergies: "", existingConditions: "", currentMedications: "",
                    patientType: "OPD", assignedDoctor: "",
                    line1: "", line2: "", city: "", state: "", pincode: "",
                    emergencyName: "", emergencyRelation: "", emergencyPhone: "",
                    ward: "", roomNo: "", bedNo: "", admissionDate: "", dischargeDate: "",
                    visitCount: 1, lastVisitDate: ""
                });
                setCapturedImage(null); // Reset image
            }

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to save patient");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ReceptionistNavbar />
            <div className="add-patient-container">
                <h2>{isEditMode ? "Edit Patient" : "Add New Patient"}</h2>
                <form className="add-patient-form" onSubmit={handleSubmit}>

                    {/* WEBCAM SECTION */}
                    <div className="form-section">
                        <h3>Patient Photo</h3>
                        <div className="webcam-container" style={{ textAlign: "center", marginBottom: "1rem" }}>
                            {!isCameraOpen && !capturedImage && (
                                <button type="button" className="camera-btn start" onClick={startCamera}>
                                    📸 {isEditMode ? "Change Photo" : "Start Camera"}
                                </button>
                            )}

                            {isCameraOpen && (
                                <div className="video-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                                    <video id="webcam-video" autoPlay playsInline style={{ width: '320px', borderRadius: '8px', border: '2px solid var(--slate-200)' }}></video>
                                    <div className="camera-controls" style={{ marginTop: '10px' }}>
                                        <button type="button" className="camera-btn capture" onClick={capturePhoto}>Capture</button>
                                        <button type="button" className="camera-btn stop" onClick={stopCamera}>Cancel</button>
                                    </div>
                                </div>
                            )}

                            {capturedImage && (
                                <div className="captured-preview">
                                    <img src={capturedImage} alt="Patient" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-500)' }} />
                                    <div style={{ marginTop: '10px' }}>
                                        <button type="button" className="camera-btn retake" onClick={retakePhoto}>Retake Photo</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PERSONAL INFO */}
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                            <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
                            <select name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            <input name="dob" type="date" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} />
                            <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
                            <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="form-section">
                        <h3>Address</h3>
                        <div className="form-grid">
                            <input name="line1" placeholder="Address Line 1" value={formData.line1} onChange={handleChange} required />
                            <input name="line2" placeholder="Address Line 2" value={formData.line2} onChange={handleChange} />
                            <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
                            <input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
                            <input name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* MEDICAL HISTORY */}
                    <div className="form-section">
                        <h3>Medical History</h3>
                        <div className="form-grid">
                            <input name="bloodGroup" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleChange} />
                            <input name="allergies" placeholder="Allergies (comma separated)" value={formData.allergies} onChange={handleChange} />
                            <input name="existingConditions" placeholder="Existing Conditions" value={formData.existingConditions} onChange={handleChange} />
                            <input name="currentMedications" placeholder="Current Medications" value={formData.currentMedications} onChange={handleChange} />
                        </div>
                    </div>

                    {/* EMERGENCY CONTACT */}
                    <div className="form-section">
                        <h3>Emergency Contact</h3>
                        <div className="form-grid">
                            <input name="emergencyName" placeholder="Contact Name" value={formData.emergencyName} onChange={handleChange} required />
                            <input name="emergencyRelation" placeholder="Relation" value={formData.emergencyRelation} onChange={handleChange} required />
                            <input name="emergencyPhone" placeholder="Phone" value={formData.emergencyPhone} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* ADMISSION DETAILS */}
                    <div className="form-section">
                        <h3>Admission Details</h3>
                        <div className="form-grid">
                            <select name="patientType" value={formData.patientType} onChange={handleChange}>
                                <option value="OPD">OPD</option>
                                <option value="IPD">IPD</option>
                            </select>

                            <select name="assignedDoctor" value={formData.assignedDoctor} onChange={handleChange} required>
                                <option value="">Select Doctor</option>
                                <option value="unassigned">Unassigned / General</option>
                                {doctors.map((doc) => (
                                    <option key={doc._id} value={doc._id}>
                                        {doc.name} - {doc.specialization}
                                    </option>
                                ))}
                            </select>

                            {/* CONDITIONAL FIELDS BASED ON PATIENT TYPE */}
                            {formData.patientType === "IPD" && (
                                <>
                                    <input name="ward" placeholder="Ward Number" value={formData.ward} onChange={handleChange} />
                                    <input name="roomNo" placeholder="Room Number" value={formData.roomNo} onChange={handleChange} />
                                    <input name="bedNo" placeholder="Bed Number" value={formData.bedNo} onChange={handleChange} />
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Admission Date</label>
                                        <input name="admissionDate" type="date" value={formData.admissionDate} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Discharge Date (Expected)</label>
                                        <input name="dischargeDate" type="date" value={formData.dischargeDate} onChange={handleChange} />
                                    </div>
                                </>
                            )}

                            {formData.patientType === "OPD" && (
                                <>
                                    <input name="visitCount" type="number" placeholder="Visit Count" value={formData.visitCount} onChange={handleChange} />
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.8rem', color: '#666' }}>Last Visit Date</label>
                                        <input name="lastVisitDate" type="date" value={formData.lastVisitDate} onChange={handleChange} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Saving..." : (isEditMode ? "Update Client" : "Register Patient")}
                    </button>
                </form>
            </div>
        </>
    );
}
