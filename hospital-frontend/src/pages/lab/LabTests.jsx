import { useState, useEffect } from "react";
import axios from "axios";
import LabNavbar from "../../components/LabNavbar";
import { LAB_TEST_MASTER } from "../../constants/labTestMaster";
import "../../styles/lab/LabTests.css";

export default function LabTests() {
    const [testCounts, setTestCounts] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://localhost:5000/api/lab/test-counts", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setTestCounts(res.data.testCounts);
                }
            } catch (err) {
                console.error("Failed to fetch test counts", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCounts();
    }, []);

    const getTotalCountForCategory = (category) => {
        const tests = LAB_TEST_MASTER[category] || [];
        return tests.reduce((sum, testName) => sum + (testCounts[testName] || 0), 0);
    };

    return (
        <>
            <LabNavbar />
            <div className="lab-tests-container">
                <header className="page-header">
                    <div>
                        <h2>Lab Test Master List</h2>
                        <p>Overview of all available tests and usage statistics</p>
                    </div>
                </header>

                {loading ? <div className="loading-state">Loading usage stats...</div> : (
                    <div className="tests-grid">
                        {Object.keys(LAB_TEST_MASTER).map(category => (
                            <div className="test-category-card" key={category}>
                                <div className="category-header">
                                    <h3>{category.replace(/_/g, ' ')}</h3>
                                    <span className="total-badge">{getTotalCountForCategory(category)} Tests Given</span>
                                </div>
                                <div className="test-list">
                                    {LAB_TEST_MASTER[category].map(testName => (
                                        <div className="test-item" key={testName}>
                                            <span className="test-name">{testName}</span>
                                            {testCounts[testName] > 0 && (
                                                <span className="count-pill">
                                                    {testCounts[testName]} {testCounts[testName] === 1 ? 'Patient' : 'Patients'}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
