import BillerNavbar from "../../components/BillerNavbar";
import "../../styles/dashboards/adminDashboard.css"; // reuse layout spacing

export default function BillerDashboard() {
  return (
    <>
      <BillerNavbar />

      <main className="admin-dashboard">
        <h1>Biller Dashboard</h1>
        <p>Create bills, generate PDFs & send via WhatsApp</p>
      </main>
    </>
  );
}
