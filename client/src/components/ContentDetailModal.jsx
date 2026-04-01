import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const DOMAIN_COLORS = {
  movies: '#ff6b6b', music: '#a78bfa', podcasts: '#f59e0b',
  videos: '#ef4444', news: '#10b981',
};
const DOMAIN_ICONS = {
  movies: '🎬', music: '🎵', podcasts: '🎙️', videos: '📹', news: '📰',
};

export default function ContentDetailModal({ item, onClose, showToast }) {
  const { isLiked, toggleLike } = useUser();
  const [realData, setRealData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [playingPreview, setPlayingPreview] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const audioRef = useRef(null);

  const liked = isLiked(item.id);
  const color = DOMAIN_COLORS[item.domain] || '#6c63ff';
  const searchQuery = item.title || item.name;

  // Fetch real API data when modal opens
  useEffect(() => {
    const fetchRealData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/real/${item.domain}?q=${encodeURIComponent(searchQuery)}`
        );
        if (res.data.success) {
          setRealData(res.data.data);
          setApiStatus('success');
        } else if (res.data.noKey) {
          setApiStatus('no-key');
        } else {
          setApiStatus('error');
        }
      } catch {
        setApiStatus('error');
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [item.id]);

  // Trap focus in modal
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleLike = () => {
    toggleLike(item);
    showToast?.(liked ? 'Removed from liked' : `Liked: ${searchQuery}`, liked ? '🤍' : '❤️');
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setPlayingPreview(false);
  };

  return (
    <div
      className="modal-overlay"
      id="content-detail-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${searchQuery}`}
    >
      <div className="modal-container" id="modal-container">

        {/* ── HEADER ── */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${color}22` }}>
          <div className="modal-header-left">
            <span className={`domain-badge domain-badge--${item.domain}`} style={{ fontSize: '0.75rem' }}>
              {DOMAIN_ICONS[item.domain]} {item.domain}
            </span>
            <h2 className="modal-title" id="modal-item-title">{searchQuery}</h2>
          </div>
          <div className="modal-header-right">
            <button
              id="modal-like-btn"
              className={`modal-action-btn ${liked ? 'liked' : ''}`}
              onClick={handleLike}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              {liked ? '❤️' : '🤍'}
            </button>
            <button
              id="modal-close-btn"
              className="modal-action-btn"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── HERO IMAGE ── */}
        <div className="modal-hero">
          <img
            src={item.image}
            alt={searchQuery}
            className="modal-hero-img"
            onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/800/400`; }}
          />
          <div className="modal-hero-gradient" />
          <div className="modal-hero-info">
            {item.rating && (
              <span className="modal-rating">⭐ {item.rating}</span>
            )}
            {(item.year || item.duration) && (
              <span className="modal-meta-pill">{item.year} {item.duration ? `· ${item.duration}` : ''}</span>
            )}
            {(item.genre?.length > 0) && (
              <span className="modal-meta-pill">{item.genre.slice(0, 2).join(' · ')}</span>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="modal-tabs" id="modal-tabs">
          {[
            { id: 'info', label: 'ℹ️ Info' },
            { id: 'real', label: `🌐 Live Data` },
            { id: 'related', label: '✨ Related' },
          ].map(tab => (
            <button
              key={tab.id}
              id={`modal-tab-${tab.id}`}
              className={`modal-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.id); stopAudio(); }}
              style={{ '--tab-color': color }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="modal-body">
          {activeTab === 'info' && <InfoTab item={item} color={color} />}
          {activeTab === 'real' && (
            <RealDataTab
              item={item}
              realData={realData}
              loading={loading}
              apiStatus={apiStatus}
              audioRef={audioRef}
              playingPreview={playingPreview}
              setPlayingPreview={setPlayingPreview}
              color={color}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === 'related' && <RelatedTab item={item} color={color} />}
        </div>
      </div>
    </div>
  );
}

/* ─── INFO TAB ─────────────────────────────────────────────── */
function InfoTab({ item, color }) {
  const META = {
    movies:   [['Director', item.director], ['Cast', item.cast?.join(', ')], ['Duration', item.duration]],
    music:    [['Artist', item.artist], ['Album', item.album], ['Duration', item.duration], ['Plays', item.plays?.toLocaleString()]],
    podcasts: [['Host', item.host], ['Duration', item.duration], ['Listeners', item.listeners?.toLocaleString()], ['Episode', item.episode]],
    videos:   [['Channel', item.channel], ['Views', item.views], ['Duration', item.duration]],
    news:     [['Source', item.source], ['Read Time', item.readTime], ['Published', item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'N/A']],
  };
  const rows = (META[item.domain] || []).filter(([, v]) => v);

  return (
    <div className="tab-content animate-fadeIn" id="tab-info">
      {/* Tags */}
      {item.genre?.length > 0 && (
        <div className="modal-section">
          <p className="modal-section-title">Genres</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {item.genre.map(g => (
              <span key={g} className="preference-tag" style={{ background: `${color}18`, color, borderColor: `${color}33` }}>{g}</span>
            ))}
          </div>
        </div>
      )}

      {/* Meta rows */}
      {rows.length > 0 && (
        <div className="modal-section">
          <p className="modal-section-title">Details</p>
          <div className="modal-detail-grid">
            {rows.map(([label, value]) => (
              <div key={label} className="modal-detail-row">
                <span className="modal-detail-label">{label}</span>
                <span className="modal-detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div className="modal-section">
          <p className="modal-section-title">Tags</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {item.tags.map(t => (
              <span key={t} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                #{t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── REAL DATA TAB ────────────────────────────────────────── */
function RealDataTab({ item, realData, loading, apiStatus, audioRef, playingPreview, setPlayingPreview, color, searchQuery }) {
  const [embedActive, setEmbedActive] = useState(false);

  if (loading) return (
    <div className="tab-content" id="tab-real-loading">
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div className="spinner" style={{ borderColor: `${color}33`, borderTopColor: color }} />
        <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '0.9rem' }}>
          Fetching live data from real APIs...
        </p>
      </div>
    </div>
  );

  if (apiStatus === 'no-key') return (
    <div className="tab-content" id="tab-real-no-key">
      <div className="api-setup-card">
        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔑</div>
        <h3 style={{ marginBottom: '8px' }}>API Key Required</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Add your free API key to <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>server/.env</code> to see live {item.domain} data.
        </p>
        <div className="api-key-instructions">
          {item.domain === 'movies' && (
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="btn btn-outline" id="get-tmdb-key-btn">
              🎬 Get Free TMDB Key
            </a>
          )}
          {item.domain === 'videos' && (
            <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="btn btn-outline" id="get-youtube-key-btn">
              📹 Get Free YouTube Key
            </a>
          )}
          {item.domain === 'news' && (
            <a href="https://newsapi.org/register" target="_blank" rel="noopener noreferrer" className="btn btn-outline" id="get-news-key-btn">
              📰 Get Free NewsAPI Key
            </a>
          )}
        </div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Then restart the server: <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>node index.js</code>
        </p>
      </div>
    </div>
  );

  if (!realData || realData.length === 0) return (
    <div className="tab-content" id="tab-real-empty">
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <p>No live results found for "{searchQuery}"</p>
      </div>
    </div>
  );

  // ── MUSIC → Real iTunes tracks with 30s audio preview ──
  if (item.domain === 'music') {
    return (
      <div className="tab-content animate-fadeIn" id="tab-real-music">
        <p className="modal-section-title" style={{ marginBottom: '16px' }}>
          🎵 Real tracks from iTunes — click to preview
        </p>
        {realData.map((track, i) => (
          <div key={i} className="real-item-row" id={`real-music-${i}`}>
            <img src={track.image} alt={track.title} className="real-item-thumb" />
            <div className="real-item-info">
              <p className="real-item-title">{track.title}</p>
              <p className="real-item-meta">{track.artist} · {track.album}</p>
            </div>
            <div className="real-item-actions">
              {track.previewUrl && (
                <button
                  id={`preview-btn-${i}`}
                  className="real-play-btn"
                  style={{ background: color }}
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.src = track.previewUrl;
                      audioRef.current.play();
                      setPlayingPreview(true);
                    }
                  }}
                  title="30s Preview"
                >
                  ▶
                </button>
              )}
              <a href={track.itunesUrl} target="_blank" rel="noopener noreferrer"
                id={`itunes-link-${i}`} className="real-link-btn" title="Open in iTunes">
                🍎
              </a>
            </div>
          </div>
        ))}
        <audio ref={audioRef} onEnded={() => setPlayingPreview(false)} style={{ display: 'none' }} />
        {playingPreview && (
          <div className="preview-bar" id="preview-bar">
            <span>🎵 Playing 30s preview...</span>
            <button onClick={() => { audioRef.current?.pause(); setPlayingPreview(false); }} className="stop-btn">⏹ Stop</button>
          </div>
        )}
      </div>
    );
  }

  // ── PODCASTS → Real iTunes podcasts with listen link ──
  if (item.domain === 'podcasts') {
    return (
      <div className="tab-content animate-fadeIn" id="tab-real-podcasts">
        <p className="modal-section-title" style={{ marginBottom: '16px' }}>
          🎙️ Real podcasts from iTunes
        </p>
        {realData.map((pod, i) => (
          <div key={i} className="real-item-row" id={`real-podcast-${i}`}>
            <img src={pod.image} alt={pod.title} className="real-item-thumb" />
            <div className="real-item-info">
              <p className="real-item-title">{pod.title}</p>
              <p className="real-item-meta">{pod.host} · {pod.trackCount} episodes</p>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                {(pod.genre || []).slice(0, 3).map(g => (
                  <span key={g} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '100px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>{g}</span>
                ))}
              </div>
            </div>
            <div className="real-item-actions">
              <a href={pod.itunesUrl} target="_blank" rel="noopener noreferrer"
                id={`itunes-podcast-${i}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                🎧 Listen
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── MOVIES → TMDB data + embedded YouTube trailer ──
  if (item.domain === 'movies') {
    return (
      <div className="tab-content animate-fadeIn" id="tab-real-movies">
        {realData.map((movie, i) => (
          <div key={i} id={`real-movie-${i}`}>
            <div className="real-item-row" style={{ marginBottom: '16px' }}>
              {movie.image && <img src={movie.image} alt={movie.title} className="real-item-thumb" style={{ aspectRatio: '2/3', width: '60px', height: '90px' }} />}
              <div className="real-item-info">
                <p className="real-item-title">{movie.title} ({movie.year})</p>
                <p className="real-item-meta">⭐ {Number(movie.rating).toFixed(1)} · TMDB</p>
                {movie.overview && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>{movie.overview.slice(0, 150)}...</p>}
              </div>
            </div>

            {/* Embedded YouTube Trailer */}
            {movie.trailerKey && (
              <div className="modal-section">
                <p className="modal-section-title">🎬 Official Trailer</p>
                {!embedActive ? (
                  <div
                    className="trailer-thumb"
                    id={`trailer-thumb-${i}`}
                    onClick={() => setEmbedActive(true)}
                    style={{ backgroundImage: `url(https://img.youtube.com/vi/${movie.trailerKey}/hqdefault.jpg)` }}
                  >
                    <div className="trailer-play-overlay">
                      <div className="trailer-play-btn" id={`trailer-play-${i}`}>▶</div>
                      <p>Watch Trailer</p>
                    </div>
                  </div>
                ) : (
                  <div className="video-embed-wrapper" id={`trailer-embed-${i}`}>
                    <iframe
                      src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1`}
                      title={`${movie.title} Trailer`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="video-embed-frame"
                    />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <a href={movie.tmdbUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" id={`tmdb-link-${i}`} style={{ fontSize: '0.8rem' }}>
                🎬 TMDB
              </a>
              {movie.imdbUrl && (
                <a href={movie.imdbUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" id={`imdb-link-${i}`} style={{ fontSize: '0.8rem' }}>
                  🏆 IMDb
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── VIDEOS → Embedded YouTube player ──
  if (item.domain === 'videos') {
    return (
      <div className="tab-content animate-fadeIn" id="tab-real-videos">
        <p className="modal-section-title" style={{ marginBottom: '16px' }}>
          📹 Real YouTube Videos — click to watch
        </p>
        {realData.map((video, i) => (
          <div key={i} className="real-video-card" id={`real-video-${i}`}>
            <YouTubeCardEmbed video={video} i={i} />
          </div>
        ))}
      </div>
    );
  }

  // ── NEWS → Full article with link ──
  if (item.domain === 'news') {
    return (
      <div className="tab-content animate-fadeIn" id="tab-real-news">
        <p className="modal-section-title" style={{ marginBottom: '16px' }}>
          📰 Live News Articles
        </p>
        {realData.map((article, i) => (
          <div key={i} className="real-news-card" id={`real-news-${i}`}>
            {article.image && <img src={article.image} alt={article.title} className="real-news-img" onError={e => e.target.style.display = 'none'} />}
            <div className="real-news-body">
              <p className="real-item-title">{article.title}</p>
              <p className="real-item-meta">{article.source} · {article.author}</p>
              {article.description && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>{article.description}</p>}
              <a href={article.articleUrl} target="_blank" rel="noopener noreferrer"
                id={`news-link-${i}`} className="btn btn-outline" style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                📖 Read Full Article →
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

/* ── Embeddable YouTube card ── */
function YouTubeCardEmbed({ video, i }) {
  const [active, setActive] = useState(false);
  return (
    <div style={{ marginBottom: '16px' }}>
      {!active ? (
        <div className="trailer-thumb" style={{ backgroundImage: `url(${video.image})` }}
          id={`yt-thumb-${i}`} onClick={() => setActive(true)}>
          <div className="trailer-play-overlay">
            <div className="trailer-play-btn" id={`yt-play-${i}`}>▶</div>
            <p style={{ fontSize: '0.8rem', maxWidth: '80%', textAlign: 'center' }}>{video.title}</p>
          </div>
        </div>
      ) : (
        <div className="video-embed-wrapper" id={`yt-embed-${i}`}>
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="video-embed-frame"
          />
        </div>
      )}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
        {video.channel}
        <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: '8px', color: '#ef4444', fontSize: '0.75rem' }}
          id={`yt-link-${i}`}>
          ↗ YouTube
        </a>
      </p>
    </div>
  );
}

/* ─── RELATED TAB ───────────────────────────────────────────── */
function RelatedTab({ item, color }) {
  const links = {
    movies:   [
      { label: '🎬 TMDB', url: `https://www.themoviedb.org/search?query=${encodeURIComponent(item.title)}` },
      { label: '🏆 IMDb', url: `https://www.imdb.com/find?q=${encodeURIComponent(item.title)}` },
      { label: '▶ YouTube Trailer', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title + ' official trailer')}` },
    ],
    music:    [
      { label: '🍎 iTunes', url: `https://music.apple.com/search?term=${encodeURIComponent((item.artist || '') + ' ' + item.title)}` },
      { label: '🎵 Spotify', url: `https://open.spotify.com/search/${encodeURIComponent(item.title)}` },
      { label: '▶ YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent((item.artist || '') + ' ' + item.title)}` },
    ],
    podcasts: [
      { label: '🎧 Apple Podcasts', url: `https://podcasts.apple.com/search?term=${encodeURIComponent(item.title)}` },
      { label: '🎙️ Spotify Podcasts', url: `https://open.spotify.com/search/${encodeURIComponent(item.title)}/podcasts` },
    ],
    videos:   [
      { label: '▶ YouTube', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}` },
      { label: '📋 Playlist', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title)}&sp=EgIQAw%253D%253D` },
    ],
    news:     [
      { label: '📰 Google News', url: `https://news.google.com/search?q=${encodeURIComponent(item.title)}` },
      { label: '🐦 Twitter', url: `https://twitter.com/search?q=${encodeURIComponent(item.title)}` },
    ],
  };

  return (
    <div className="tab-content animate-fadeIn" id="tab-related">
      <div className="modal-section">
        <p className="modal-section-title">🔗 External Links & Resources</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(links[item.domain] || []).map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              id={`related-link-${i}`}
              className="external-link-row"
              style={{ '--row-color': color }}
            >
              <span>{link.label}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>↗ Open</span>
            </a>
          ))}
        </div>
      </div>

      <div className="modal-section">
        <p className="modal-section-title">💡 About This Recommendation</p>
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-color)' }}>
          {item.reason ? (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong style={{ color }}>Why we recommended this:</strong><br />
              {item.reason}
            </p>
          ) : (
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              This content was selected based on your genre preferences and activity.
              Like items to teach NexRec what you love!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
