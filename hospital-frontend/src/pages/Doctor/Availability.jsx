import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Doctor/Availability.css";

export default function Availability() {
    const [availability, setAvailability] = useState({ days: [], from: "", to: "" });
    const [loading, setLoading] = useState(true);

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5000/api/doctor/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.availability) {
                // Ensure days is an array
                let fetchedDays = res.data.availability.days;
                if (!Array.isArray(fetchedDays)) {
                    // Handle potential legacy non-array data by wrapping or resetting
                    fetchedDays = typeof fetchedDays === 'string' ? [fetchedDays] : [];
                }
                setAvailability({ ...res.data.availability, days: fetchedDays });
            }
        } catch (err) {
            console.error("Failed to fetch availability");
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day) => {
        setAvailability(prev => {
            const currentDays = Array.isArray(prev.days) ? prev.days : [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];

            // Sort based on week order
            newDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

            return { ...prev, days: newDays };
        });
    };

    const handleAvailabilityUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://localhost:5000/api/doctor/availability", availability, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Availability updated successfully");
        } catch (err) {
            alert("Failed to update availability");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="availability-container">
            <div className="availability-card">
                <h2 style={{ marginBottom: "2rem", color: "var(--primary-800)" }}>Manage Availability</h2>

                <form onSubmit={handleAvailabilityUpdate} className="form-grid">
                    <div className="form-group full-width">
                        <label>Days Available</label>
                        <div className="day-selector">
                            {daysOfWeek.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    className={`day-btn ${availability.days?.includes(day) ? 'selected' : ''}`}
                                    onClick={() => toggleDay(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                        {(!availability.days || availability.days.length === 0) && (
                            <small style={{ color: 'var(--slate-400)', marginTop: '0.5rem', display: 'block' }}>
                                Select the days you are available
                            </small>
                        )}
                    </div>
                    <div className="form-group">
                        <label>From Time</label>
                        <input
                            type="time"
                            value={availability.from}
                            onChange={(e) => setAvailability({ ...availability, from: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>To Time</label>
                        <input
                            type="time"
                            value={availability.to}
                            onChange={(e) => setAvailability({ ...availability, to: e.target.value })}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn-primary">Save Availability</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
