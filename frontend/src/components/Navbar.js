import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>MODGUARD</Link>

      <div style={styles.links}>
        {user.role === 'user' && (
          <>
            <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}>Dashboard</Link>
            <Link to="/submit" style={{ ...styles.link, ...(isActive('/submit') ? styles.activeLink : {}) }}>Submit</Link>
            <Link to="/history" style={{ ...styles.link, ...(isActive('/history') ? styles.activeLink : {}) }}>History</Link>
            <Link to="/appeals" style={{ ...styles.link, ...(isActive('/appeals') ? styles.activeLink : {}) }}>Appeals</Link>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <Link to="/dashboard" style={{ ...styles.link, ...(isActive('/dashboard') ? styles.activeLink : {}) }}>Dashboard</Link>
            <Link to="/admin/appeals" style={{ ...styles.link, ...(isActive('/admin/appeals') ? styles.activeLink : {}) }}>Appeals</Link>
            <Link to="/admin/policies" style={{ ...styles.link, ...(isActive('/admin/policies') ? styles.activeLink : {}) }}>Policies</Link>
            <Link to="/admin/analytics" style={{ ...styles.link, ...(isActive('/admin/analytics') ? styles.activeLink : {}) }}>Analytics</Link>
          </>
        )}
      </div>

      <div style={styles.right}>
        <span style={styles.userInfo}>
          {user.name}
          <span style={styles.role}>{user.role}</span>
        </span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '56px',
    borderBottom: '1px solid #2a2a2a',
    backgroundColor: '#0a0a0a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: '15px',
    letterSpacing: '0.15em',
    color: '#f0f0f0',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '32px',
  },
  link: {
    color: '#888',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: '0.02em',
  },
  activeLink: {
    color: '#f0f0f0',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    fontSize: '12px',
    color: '#888',
  },
  role: {
    backgroundColor: '#2a2a2a',
    color: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginLeft: '6px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #2a2a2a',
    color: '#888',
    padding: '6px 14px',
    fontSize: '12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar;