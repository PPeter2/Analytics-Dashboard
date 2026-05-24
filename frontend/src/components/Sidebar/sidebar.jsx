import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdAssessment, MdSettings, MdLogout } from 'react-icons/md';
import style from './sidebar.module.css';

function Sidebar() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  };

  const isActive = (path) => location.pathname === path ? style.active : '';

  return (
    <aside className={style.sidebar}>
      <div className={style.logoContainer}>
        <h2>Analytics</h2>
        <span className={style.logoDot}>.</span>
      </div>

      <nav className={style.nav}>
        <ul className={style.menuList}>
          {/* Προσθήκη --item-index για το staggered animation εισόδου */}
          <li style={{ '--item-index': 1 }}>
            <Link to="/dashboard" className={`${style.navLink} ${isActive('/dashboard')}`}>
              <MdDashboard className={style.icon} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li style={{ '--item-index': 2 }}>
            <Link to="/reports" className={`${style.navLink} ${isActive('/reports')}`}>
              <MdAssessment className={style.icon} />
              <span>Reports</span>
            </Link>
          </li>
          <li style={{ '--item-index': 3 }}>
            <Link to="/settings" className={`${style.navLink} ${isActive('/settings')}`}>
              <MdSettings className={style.icon} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className={style.footer} style={{ '--item-index': 4 }}>
        <button onClick={handleLogout} className={style.logoutButton}>
          <MdLogout className={style.icon} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
