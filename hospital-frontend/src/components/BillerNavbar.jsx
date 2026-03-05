import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/navbar/AdminNavbar.css"; // Shared styles

export default function BillerNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { label: "Dashboard", icon: "🏠", path: "/biller" },
    { label: "Regular Bill", icon: "🏥", path: "/biller/create" },
    { label: "WOD Bills", icon: "💰", path: "/biller/wod" },
    { label: "Bill History", icon: "📜", path: "/biller/history" },
    { label: "Patients", icon: "👥", path: "/biller/patients" },
    { label: "Profile", icon: "👤", path: "/biller/profile" },
  ];

  return (
    <>
      <header className="app-navbar">
        <div className="left">
          <button
            className="menu-btn"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>
          <h3>NS multispeciality hospital</h3>
        </div>

        <div className="right">
          <span className="role-badge">Biller</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <aside className={`app-sidebar ${open ? "open" : ""}`}>
        <h4>Menu</h4>
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={location.pathname === item.path ? "active" : ""}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}
    </>
  );
}
