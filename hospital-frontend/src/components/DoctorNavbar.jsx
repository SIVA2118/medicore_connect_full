import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar/AdminNavbar.css"; // Shared styles

export default function DoctorNavbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { label: "Dashboard", icon: "🏠", path: "/doctor" },
    { label: "My Patients", icon: "👥", path: "/doctor/patients" },
    { label: "Availability", icon: "⏰", path: "/doctor/availability" },
    { label: "Profile", icon: "👤", path: "/doctor/profile" },
  ];

  return (
    <>
      <header className="app-navbar">
        <div className="left">
          <button
            className="menu-btn"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          <h3>NS multispeciality hospital</h3>
        </div>

        <div className="right">
          <span className="role-badge">Doctor</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <aside className={`app-sidebar ${isMobileOpen ? "open" : ""}`}>
        <h4>Menu</h4>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={
                location.pathname === item.path ||
                  (item.path !== "/doctor" && location.pathname.startsWith(item.path.split("/").slice(0, 3).join("/")))
                  ? "active"
                  : ""
              }
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) setIsMobileOpen(false);
              }}
            >
              <span title={item.label}>{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* OVERLAY (Mobile) */}
      {isMobileOpen && (
        <div
          className="overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
