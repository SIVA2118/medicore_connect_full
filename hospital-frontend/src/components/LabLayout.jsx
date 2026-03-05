import LabNavbar from "./LabNavbar";

export default function LabLayout({ children }) {
    return (
        <div className="lab-layout">
            <LabNavbar />
            <main className="lab-main-content">
                {children}
            </main>
        </div>
    );
}
