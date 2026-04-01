import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ContentCard from '../components/ContentCard';
import { useUser } from '../context/UserContext';

const HERO_ITEMS = [
  {
    title: 'Dune: Part Two',
    subtitle: 'The epic saga continues. Paul Atreides unites with Chani and the Fremen.',
    image: 'https://picsum.photos/seed/hero1/1400/600',
    badge: '🔥 Trending Movie',
    domain: 'movies',
  },
  {
    title: 'Lex Fridman Podcast',
    subtitle: 'Deep conversations on AI, science, and the future of humanity.',
    image: 'https://picsum.photos/seed/hero2/1400/600',
    badge: '🎙️ Hot Podcast',
    domain: 'podcasts',
  },
  {
    title: 'Blinding Lights',
    subtitle: 'The Weeknd\'s iconic synthpop anthem — still going strong.',
    image: 'https://picsum.photos/seed/hero3/1400/600',
    badge: '🎵 Top Music',
    domain: 'music',
  },
];

export default function Home({ showToast, onCardClick }) {
  const { preferences, likedItems, history, user } = useUser();
  const [recs, setRecs] = useState({ personalized: [], crossDomain: [], trending: [] });
  const [contentAll, setContentAll] = useState({ movies: [], music: [], podcasts: [], videos: [], news: [] });
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);

  // Cycle hero slides
  useEffect(() => {
    const timer = setInterval(() => setHeroIdx(i => (i + 1) % HERO_ITEMS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [moviesRes, musicRes, podcastsRes, videosRes, newsRes, recsRes] = await Promise.all([
        axios.get('/api/content/movies'),
        axios.get('/api/content/music'),
        axios.get('/api/content/podcasts'),
        axios.get('/api/content/videos'),
        axios.get('/api/content/news'),
        axios.post('/api/recommendations', { preferences, likedItems, history }),
      ]);

      setContentAll({
        movies: moviesRes.data.data,
        music: musicRes.data.data,
        podcasts: podcastsRes.data.data,
        videos: videosRes.data.data,
        news: newsRes.data.data,
      });
      setRecs(recsRes.data.data);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePlay = (item) => {
    if (onCardClick) onCardClick(item);
    else showToast(`Now viewing: ${item.title || item.name}`, DOMAIN_ICON[item.domain]);
  };

  const DOMAIN_ICON = { movies: '🎬', music: '🎵', podcasts: '🎙️', videos: '📹', news: '📰' };

  const hero = HERO_ITEMS[heroIdx];

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="page-container animate-fadeIn">

      {/* Hero Carousel */}
      <section className="hero" id="home-hero">
        <img className="hero-bg" src={hero.image} alt="hero background" />
        <div className="hero-gradient" />
        <div className="hero-content">
          <div className="hero-badge">{hero.badge}</div>
          <h1 className="hero-title">{hero.title}</h1>
          <p className="hero-subtitle">{hero.subtitle}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" id="hero-explore-btn" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
              ▶ Explore Now
            </button>
            <button className="btn btn-secondary" id="hero-scroll-btn" onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}>
              📋 See More
            </button>
          </div>
        </div>
        {/* Hero dots */}
        <div style={{ position: 'absolute', bottom: '20px', right: '24px', display: 'flex', gap: '6px', zIndex: 2 }}>
          {HERO_ITEMS.map((_, i) => (
            <button
              key={i}
              id={`hero-dot-${i}`}
              onClick={() => setHeroIdx(i)}
              style={{
                width: i === heroIdx ? '20px' : '8px',
                height: '8px',
                borderRadius: '100px',
                background: i === heroIdx ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Hero slide ${i + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Domain Stats Bar */}
      <div className="stats-bar" id="domain-stats">
        {[
          { domain: 'movies', icon: '🎬', label: 'Movies', count: contentAll.movies.length },
          { domain: 'music', icon: '🎵', label: 'Music', count: contentAll.music.length },
          { domain: 'podcasts', icon: '🎙️', label: 'Podcasts', count: contentAll.podcasts.length },
          { domain: 'videos', icon: '📹', label: 'Videos', count: contentAll.videos.length },
          { domain: 'news', icon: '📰', label: 'News', count: contentAll.news.length },
        ].map(d => (
          <div key={d.domain} className="stat-card" data-domain={d.domain} id={`stat-${d.domain}`}>
            <div className="stat-icon">{d.icon}</div>
            <div className="stat-value">{d.count}+</div>
            <div className="stat-label">{d.label}</div>
          </div>
        ))}
      </div>

      {/* Personalized For You */}
      {recs.personalized?.length > 0 && (
        <section className="section" id="section-personalized">
          <div className="section-header">
            <h2 className="section-title"><span className="section-emoji">✨</span> For You, {user?.name}</h2>
            <a href="/explore" className="see-all-btn">See all →</a>
          </div>
          <div className="carousel carousel--wide" id="carousel-personalized">
            {recs.personalized.map(item => (
              <ContentCard key={item.id} item={item} showReason onCardClick={handlePlay} />
            ))}
          </div>
        </section>
      )}

      {/* 🌐 Cross-Domain Section */}
      {recs.crossDomain?.length > 0 && (
        <div className="cross-domain-card" id="section-cross-domain">
          <div className="cross-domain-header">
            <h2 className="section-title" style={{ fontSize: '1.2rem' }}>
              <span className="section-emoji">🌐</span>
              <span>Cross-Domain Discoveries</span>
            </h2>
            <span className="cross-domain-tag">AI-Powered</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Based on what you love, NexRec found amazing content in domains you haven't explored yet.
          </p>
          <div className="carousel" id="carousel-cross-domain">
            {recs.crossDomain.map(item => (
              <ContentCard key={item.id} item={item} showReason onCardClick={handlePlay} />
            ))}
          </div>
        </div>
      )}

      {/* 🎬 Movies */}
      <section className="section" id="section-movies">
        <div className="section-header">
          <h2 className="section-title"><span className="section-emoji">🎬</span> Top Movies</h2>
          <a href="/explore?domain=movies" className="see-all-btn">See all →</a>
        </div>
        <div className="carousel carousel--portrait" id="carousel-movies">
          {contentAll.movies.map(item => (
            <ContentCard key={item.id} item={item} onCardClick={handlePlay} />
          ))}
        </div>
      </section>

      {/* 🎵 Music */}
      <section className="section" id="section-music">
        <div className="section-header">
          <h2 className="section-title"><span className="section-emoji">🎵</span> Music You'll Love</h2>
          <a href="/explore?domain=music" className="see-all-btn">See all →</a>
        </div>
        <div className="carousel" id="carousel-music">
          {contentAll.music.map(item => (
            <ContentCard key={item.id} item={item} onCardClick={handlePlay} />
          ))}
        </div>
      </section>

      {/* 📈 Trending */}
      {recs.trending?.length > 0 && (
        <section className="section" id="section-trending">
          <div className="section-header">
            <h2 className="section-title"><span className="section-emoji">📈</span> Trending Now</h2>
          </div>
          <div className="carousel carousel--wide" id="carousel-trending">
            {recs.trending.map(item => (
              <ContentCard key={item.id} item={item} showReason onCardClick={handlePlay} />
            ))}
          </div>
        </section>
      )}

      {/* 🎙️ Podcasts */}
      <section className="section" id="section-podcasts">
        <div className="section-header">
          <h2 className="section-title"><span className="section-emoji">🎙️</span> Podcasts to Tune Into</h2>
          <a href="/explore?domain=podcasts" className="see-all-btn">See all →</a>
        </div>
        <div className="carousel carousel--wide" id="carousel-podcasts">
          {contentAll.podcasts.map(item => (
            <ContentCard key={item.id} item={item} onCardClick={handlePlay} />
          ))}
        </div>
      </section>

      {/* 📹 Videos */}
      <section className="section" id="section-videos">
        <div className="section-header">
          <h2 className="section-title"><span className="section-emoji">📹</span> Watch-Worthy Videos</h2>
          <a href="/explore?domain=videos" className="see-all-btn">See all →</a>
        </div>
        <div className="carousel carousel--wide" id="carousel-videos">
          {contentAll.videos.map(item => (
            <ContentCard key={item.id} item={item} onCardClick={handlePlay} />
          ))}
        </div>
      </section>

      {/* 📰 News */}
      <section className="section" id="section-news">
        <div className="section-header">
          <h2 className="section-title"><span className="section-emoji">📰</span> Latest News</h2>
          <a href="/explore?domain=news" className="see-all-btn">See all →</a>
        </div>
        <div className="carousel carousel--news" id="carousel-news">
          {contentAll.news.map(item => (
            <ContentCard key={item.id} item={item} onCardClick={handlePlay} />
          ))}
        </div>
      </section>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="page-container">
      <div className="skeleton" style={{ height: '400px', borderRadius: '24px', marginBottom: '48px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '48px' }}>
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />)}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '48px', overflow: 'hidden' }}>
        {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ minWidth: '200px', height: '280px', borderRadius: '16px' }} />)}
      </div>
    </div>
  );
}
