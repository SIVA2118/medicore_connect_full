export default function Navbar() {
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header className="simple-navbar">
      <h3>{role?.toUpperCase()} DASHBOARD</h3>
      <button onClick={logout}>Logout</button>
    </header>
  );
}
