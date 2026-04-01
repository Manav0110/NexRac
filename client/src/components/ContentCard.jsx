import React from 'react';
import { useUser } from '../context/UserContext';

const DOMAIN_ICONS = {
  movies: '🎬',
  music: '🎵',
  podcasts: '🎙️',
  videos: '📹',
  news: '📰',
};

const DOMAIN_META = {
  movies: (item) => item.director || item.genre?.join(' · '),
  music: (item) => item.artist,
  podcasts: (item) => item.host,
  videos: (item) => item.channel,
  news: (item) => item.source,
};

const DOMAIN_SUB = {
  movies: (item) => `${item.year} · ${item.duration}`,
  music: (item) => `${item.duration} · ${(item.plays / 1e6).toFixed(1)}M plays`,
  podcasts: (item) => item.duration,
  videos: (item) => `${item.views} views · ${item.duration}`,
  news: (item) => `${item.readTime} read`,
};

export default function ContentCard({ item, variant = 'default', showReason = false, onPlay, onCardClick }) {
  const { isLiked, toggleLike, addToHistory } = useUser();

  const liked = isLiked(item.id);
  const icon = DOMAIN_ICONS[item.domain] || '📄';
  const meta = DOMAIN_META[item.domain]?.(item) || '';
  const sub = DOMAIN_SUB[item.domain]?.(item) || '';

  const getAspect = () => {
    if (item.domain === 'movies') return 'portrait';
    if (item.domain === 'music') return 'square';
    return 'default';
  };

  const handleCardClick = () => {
    addToHistory(item);
    // Open detail modal if handler provided, otherwise fallback to onPlay
    if (onCardClick) onCardClick(item);
    else if (onPlay) onPlay(item);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(item);
  };


  const aspectClass = getAspect() === 'portrait'
    ? 'content-card--portrait'
    : getAspect() === 'square'
      ? 'content-card--square'
      : '';

  return (
    <div
      className={`content-card ${aspectClass}`}
      id={`card-${item.id}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleCardClick()}
      aria-label={`${item.title || item.name} - ${item.domain}`}
    >
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          className="content-card-image"
          src={item.image}
          alt={item.title || item.name}
          loading="lazy"
          onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/400/300`; }}
        />
        {/* Hover Play Overlay */}
        <div className="card-overlay">
          <button className="play-btn" onClick={handleCardClick} aria-label="Play">
            {item.domain === 'news' ? '📖' : '▶'}
          </button>
        </div>
      </div>

      {/* Like Button */}
      <button
        className={`like-btn ${liked ? 'liked' : ''}`}
        id={`like-btn-${item.id}`}
        onClick={handleLike}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        {liked ? '❤️' : '🤍'}
      </button>

      {/* Domain Badge (top-left, inside card body) */}
      <div className="content-card-body">
        <div style={{ marginBottom: '6px' }}>
          <span className={`domain-badge domain-badge--${item.domain}`}>
            {icon} {item.domain}
          </span>
        </div>

        <div className="content-card-title">{item.title || item.name}</div>

        {meta && (
          <div className="content-card-meta">
            <span>{meta}</span>
            {item.rating && (
              <span className="content-card-rating">⭐ {item.rating}</span>
            )}
          </div>
        )}

        {sub && (
          <div className="content-card-meta" style={{ marginTop: '2px', opacity: 0.7 }}>
            {sub}
          </div>
        )}

        {showReason && item.reason && (
          <div className="rec-reason">
            <span className="rec-reason-icon">
              {item.recommendationType === 'cross-domain' ? '🌐' :
               item.recommendationType === 'trending' ? '📈' : '✨'}
            </span>
            {item.reason}
          </div>
        )}
      </div>
    </div>
  );
}
