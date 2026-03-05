import LabNavbar from "../../components/LabNavbar";
import "../../styles/lab/Tests.css";

export default function Tests() {
    // Placeholder data for available tests
    const tests = [
        { id: 1, name: "Complete Blood Count (CBC)", category: "Hematology", icon: "🩸" },
        { id: 2, name: "Lipid Profile", category: "Biochemistry", icon: "🧪" },
        { id: 3, name: "Thyroid Function Test", category: "Hormones", icon: "🦋" },
        { id: 4, name: "Liver Function Test", category: "Biochemistry", icon: "liver" },
        { id: 5, name: "Kidney Function Test", category: "Biochemistry", icon: "kidney" },
        { id: 6, name: "Blood Glucose (Fasting/PP)", category: "Diabetes", icon: "🍬" },
    ];

    return (
        <>
            <LabNavbar />
            <div className="tests-container">
                <h2>Available Tests Directory</h2>
                <p style={{ color: '#64748b' }}>Manage and view all laboratory tests available in the system.</p>

                <div className="tests-grid">
                    {tests.map(test => (
                        <div key={test.id} className="test-card">
                            <div className="test-icon">{test.icon}</div>
                            <div className="test-info">
                                <h3>{test.name}</h3>
                                <p>{test.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
