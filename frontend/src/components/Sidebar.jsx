import './Sidebar.css';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';

export const Sidebar = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Route2Rise</h1>
        <p>Lead Management</p>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/dashboard"
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          <span className="icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link
          to="/leads"
          className={`nav-item ${isActive('/leads') ? 'active' : ''}`}
        >
          <span className="icon">📋</span>
          <span>Leads</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <p className="founder-name">{user.founder}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};
