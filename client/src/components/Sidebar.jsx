import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const DOMAIN_COLORS = {
  movies: '#ff6b6b',
  music: '#a78bfa',
  podcasts: '#f59e0b',
  videos: '#ef4444',
  news: '#10b981',
};

export default function Sidebar() {
  const { likedItems, history } = useUser();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">✦ NexRec</div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">Navigation</p>
        <NavLink to="/" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} id="nav-home">
          <span className="sidebar-nav-icon">🏠</span> Home
        </NavLink>
        <NavLink to="/explore" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} id="nav-explore">
          <span className="sidebar-nav-icon">🔭</span> Explore
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} id="nav-search">
          <span className="sidebar-nav-icon">🔍</span> Search
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} id="nav-profile">
          <span className="sidebar-nav-icon">👤</span> Profile
        </NavLink>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">Content</p>
        {[
          { id: 'movies', icon: '🎬', label: 'Movies' },
          { id: 'music', icon: '🎵', label: 'Music' },
          { id: 'podcasts', icon: '🎙️', label: 'Podcasts' },
          { id: 'videos', icon: '📹', label: 'Videos' },
          { id: 'news', icon: '📰', label: 'News' },
        ].map(domain => (
          <button
            key={domain.id}
            id={`sidebar-${domain.id}`}
            className="sidebar-nav-item"
            onClick={() => navigate(`/explore?domain=${domain.id}`)}
          >
            <span className="sidebar-nav-icon">{domain.icon}</span>
            {domain.label}
            <span
              className="domain-dot"
              style={{ background: DOMAIN_COLORS[domain.id], marginLeft: 'auto' }}
            />
          </button>
        ))}
      </div>

      <div className="sidebar-section" style={{ marginTop: 'auto' }}>
        <p className="sidebar-section-title">Activity</p>
        <div className="sidebar-nav-item" style={{ cursor: 'default', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sidebar-nav-icon">❤️</span> Liked
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(108,99,255,0.15)', color: '#a78bfa', borderRadius: '100px', padding: '2px 8px' }}>
            {likedItems.length}
          </span>
        </div>
        <div className="sidebar-nav-item" style={{ cursor: 'default', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="sidebar-nav-icon">🕐</span> History
          </span>
          <span style={{ fontSize: '0.75rem', background: 'rgba(108,99,255,0.15)', color: '#a78bfa', borderRadius: '100px', padding: '2px 8px' }}>
            {history.length}
          </span>
        </div>
      </div>
    </aside>
  );
}
