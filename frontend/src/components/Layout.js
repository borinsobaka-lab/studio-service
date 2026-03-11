import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const styles = {
  container: { minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Segoe UI', sans-serif" },
  nav: { background: '#1a1a2e', color: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, justifyContent: 'space-between' },
  brand: { fontSize: 18, fontWeight: 700, color: '#e94560', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: 16, alignItems: 'center' },
  navLink: { color: '#ccc', textDecoration: 'none', fontSize: 14, padding: '6px 12px', borderRadius: 6 },
  navLinkActive: { color: '#fff', background: '#e94560', textDecoration: 'none', fontSize: 14, padding: '6px 12px', borderRadius: 6 },
  logoutBtn: { background: 'none', border: '1px solid #555', color: '#ccc', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  content: { maxWidth: 960, margin: '0 auto', padding: 24 },
};

export default function Layout({ children, onLogout }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brand}>Studio Stretch</Link>
        <div style={styles.navLinks}>
          <Link to="/" style={isActive('/') ? styles.navLinkActive : styles.navLink}>Записи</Link>
          <Link to="/prompts" style={isActive('/prompts') ? styles.navLinkActive : styles.navLink}>Промпты</Link>
          <button onClick={onLogout} style={styles.logoutBtn}>Выйти</button>
        </div>
      </nav>
      <div style={styles.content}>{children}</div>
    </div>
  );
}
