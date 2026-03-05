import BillerNavbar from "./BillerNavbar";
import "./BillerLayout.css";

export default function BillerLayout({ children }) {
    return (
        <div className="biller-layout">
            <BillerNavbar />
            <main className="biller-main-content">
                {children}
            </main>
        </div>
    );
}
