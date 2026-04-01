import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const menuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <form onSubmit={handleSearch} className="navbar-search" id="navbar-search-form">
          <span className="search-icon">🔍</span>
          <input
            id="navbar-search-input"
            type="text"
            placeholder="Search movies, music, podcasts..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search all content"
          />
        </form>
      </div>

      <div className="navbar-right">
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          👋 <span style={{ color: 'var(--text-secondary)' }}>Hi, {user?.name || 'there'}!</span>
        </div>

        {/* Avatar + dropdown menu */}
        <div className="avatar-menu-wrap" ref={menuRef}>
          <button
            className="avatar-btn"
            id="avatar-btn"
            onClick={() => setMenuOpen(o => !o)}
            title="Account menu"
            aria-label="Open account menu"
            aria-expanded={menuOpen}
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="avatar-dropdown" id="avatar-dropdown">
              <div className="avatar-dropdown-header">
                <div className="avatar-dropdown-name">{user?.name}</div>
                <div className="avatar-dropdown-email">{user?.email}</div>
              </div>
              <div className="avatar-dropdown-divider" />
              <button
                className="avatar-dropdown-item"
                id="nav-profile-btn"
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
              >
                👤 My Profile
              </button>
              <button
                className="avatar-dropdown-item"
                id="nav-explore-btn"
                onClick={() => { navigate('/explore'); setMenuOpen(false); }}
              >
                🔭 Explore
              </button>
              <div className="avatar-dropdown-divider" />
              <button
                className="avatar-dropdown-item avatar-dropdown-item--danger"
                id="nav-logout-btn"
                onClick={handleLogout}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
