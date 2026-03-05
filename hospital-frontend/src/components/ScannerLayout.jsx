import ScannerNavbar from "./ScannerNavbar";

export default function ScannerLayout({ children }) {
    return (
        <div className="scanner-layout">
            <ScannerNavbar />
            <main className="scanner-main-content">
                {children}
            </main>
        </div>
    );
}
