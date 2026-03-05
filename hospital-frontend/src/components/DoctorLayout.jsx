import DoctorNavbar from "../components/DoctorNavbar";
import "./DoctorLayout.css";

export default function DoctorLayout({ children }) {
    return (
        <div className="doctor-layout">
            <DoctorNavbar />
            <main className="doctor-main-content">
                {children}
            </main>
        </div>
    );
}
