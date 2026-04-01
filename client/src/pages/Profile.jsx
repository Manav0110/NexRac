import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import ContentCard from '../components/ContentCard';

const DOMAIN_COLORS = {
  movies: '#ff6b6b', music: '#a78bfa', podcasts: '#f59e0b', videos: '#ef4444', news: '#10b981',
};
const DOMAIN_ICONS = {
  movies: '🎬', music: '🎵', podcasts: '🎙️', videos: '📹', news: '📰',
};

function AccountSection({ user, showToast }) {
  const { setUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const body = { name };
      if (newPass) { body.currentPassword = currentPass; body.newPassword = newPass; }
      const res = await axios.put('/api/auth/profile', body);
      if (res.data.success) {
        setUser(res.data.user);
        setMsg('✅ Profile updated!');
        setEditing(false);
        setCurrentPass(''); setNewPass('');
        showToast?.('Profile updated!', '✅');
      } else {
        setMsg(`❌ ${res.data.error}`);
      }
    } catch (e) {
      setMsg(`❌ ${e.response?.data?.error || 'Update failed'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-account-card" id="account-section">
      <div className="profile-account-row">
        <div>
          <div className="profile-account-label">Full Name</div>
          {editing ? (
            <input
              id="profile-name-input"
              className="auth-input"
              style={{ marginTop: '4px', padding: '8px 12px', fontSize: '0.9rem' }}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          ) : (
            <div className="profile-account-value">{user?.name}</div>
          )}
        </div>
        <div>
          <div className="profile-account-label">Email</div>
          <div className="profile-account-value">{user?.email}</div>
        </div>
        <div>
          <div className="profile-account-label">Member Since</div>
          <div className="profile-account-value">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
          </div>
        </div>
      </div>

      {editing && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="profile-account-label">Change Password (optional)</div>
          <input
            id="profile-current-pass"
            className="auth-input"
            type="password"
            placeholder="Current password"
            value={currentPass}
            onChange={e => setCurrentPass(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          />
          <input
            id="profile-new-pass"
            className="auth-input"
            type="password"
            placeholder="New password (min. 6 chars)"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            style={{ padding: '8px 12px', fontSize: '0.9rem' }}
          />
        </div>
      )}

      {msg && <p style={{ marginTop: '10px', fontSize: '0.85rem', color: msg.startsWith('✅') ? '#10b981' : '#ef4444' }}>{msg}</p>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        {editing ? (
          <>
            <button className="btn btn-primary" id="save-profile-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '✅ Save Changes'}
            </button>
            <button className="btn btn-secondary" id="cancel-profile-btn" onClick={() => { setEditing(false); setMsg(''); }}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn btn-secondary" id="edit-profile-btn" onClick={() => setEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default function Profile({ onCardClick, showToast }) {
  const { user, preferences, likedItems, history, logout } = useUser();

  const domainCounts = likedItems.reduce((acc, item) => {
    acc[item.domain] = (acc[item.domain] || 0) + 1;
    return acc;
  }, {});

  const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
    }
  };

  return (
    <div className="page-container animate-fadeIn">
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '24px' }}>Your Profile</h1>

      {/* Profile Header Card */}
      <div className="profile-header" id="profile-header">
        <div className="profile-avatar" id="profile-avatar">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <div className="profile-name gradient-text">{user?.name || 'Explorer'}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>{user?.email}</div>
          <div className="profile-stats">
            <div className="profile-stat">
              <strong id="liked-count">{likedItems.length}</strong>
              Liked Items
            </div>
            <div className="profile-stat">
              <strong id="history-count">{history.length}</strong>
              Viewed
            </div>
            <div className="profile-stat">
              <strong id="domains-count">{Object.keys(domainCounts).length}</strong>
              Domains
            </div>
          </div>
          {topDomain && (
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              🏆 Favorite domain:{' '}
              <strong style={{ color: DOMAIN_COLORS[topDomain[0]] }}>
                {DOMAIN_ICONS[topDomain[0]]} {topDomain[0].charAt(0).toUpperCase() + topDomain[0].slice(1)}
              </strong>
            </p>
          )}
        </div>
      </div>

      {/* Account Details */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          👤 Account Details
        </h2>
        <AccountSection user={user} showToast={showToast} />
      </div>

      {/* Preference Tags */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
        <div id="pref-genres-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px' }}>🎭 Liked Genres</h3>
          <div className="preference-tags">
            {preferences.likedGenres.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Like content to see your genres</p>
            ) : preferences.likedGenres.map(g => (
              <span key={g} className="preference-tag">{g}</span>
            ))}
          </div>
        </div>

        <div id="pref-domains-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px' }}>🌐 Content Domains</h3>
          <div className="preference-tags">
            {preferences.likedDomains.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Explore more content</p>
            ) : preferences.likedDomains.map(d => (
              <span key={d} className="preference-tag" style={{ color: DOMAIN_COLORS[d], background: `${DOMAIN_COLORS[d]}1a`, borderColor: `${DOMAIN_COLORS[d]}44` }}>
                {DOMAIN_ICONS[d]} {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Domain Breakdown */}
      {Object.keys(domainCounts).length > 0 && (
        <div id="domain-breakdown" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '20px' }}>📊 Your Content Mix</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).map(([domain, count]) => {
              const pct = Math.round((count / likedItems.length) * 100);
              return (
                <div key={domain} id={`breakdown-${domain}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {DOMAIN_ICONS[domain]} {domain.charAt(0).toUpperCase() + domain.slice(1)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: DOMAIN_COLORS[domain], borderRadius: '100px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liked Items */}
      {likedItems.length > 0 && (
        <section className="section" id="liked-items-section">
          <div className="section-header">
            <h2 className="section-title"><span className="section-emoji">❤️</span> Liked Items</h2>
          </div>
          <div className="content-grid" id="liked-items-grid">
            {likedItems.map(item => (
              <ContentCard key={item.id} item={item} onCardClick={onCardClick} />
            ))}
          </div>
        </section>
      )}

      {/* Recent History */}
      {history.length > 0 && (
        <section className="section" id="history-section">
          <div className="section-header">
            <h2 className="section-title"><span className="section-emoji">🕐</span> Recently Viewed</h2>
          </div>
          <div className="carousel carousel--wide" id="history-carousel">
            {history.slice(0, 10).map(item => (
              <ContentCard key={item.id} item={item} onCardClick={onCardClick} />
            ))}
          </div>
        </section>
      )}

      {/* Danger Zone */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '32px', marginTop: '32px' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>⚙️ Account Actions</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            id="logout-profile-btn"
            onClick={handleLogout}
            style={{ borderColor: 'rgba(255,100,100,0.3)', color: '#ff6b6b' }}
          >
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
