import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ContentCard from '../components/ContentCard';

const QUICK_TAGS = ['AI', 'Trending', 'Action', 'Comedy', 'Technology', 'Health', 'Science', 'Music', 'True Crime', 'Space'];

export default function Search({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setSearchParams({ q });
    try {
      const res = await axios.get(`/api/content/search?q=${encodeURIComponent(q)}`);
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch(query);
  };

  const handlePlay = (item) => {
    showToast(`Now viewing: ${item.title}`, '▶');
  };

  // Group results by domain
  const grouped = results.reduce((acc, item) => {
    if (!acc[item.domain]) acc[item.domain] = [];
    acc[item.domain].push(item);
    return acc;
  }, {});

  const DOMAIN_ICONS = { movies: '🎬', music: '🎵', podcasts: '🎙️', videos: '📹', news: '📰' };

  return (
    <div className="page-container animate-fadeIn">
      <div className="search-hero" id="search-page">
        <h1 className="search-hero-title">
          Find anything, <span className="gradient-text">anywhere</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1rem' }}>
          Search across movies, music, podcasts, videos, and news — all in one place.
        </p>
        <form onSubmit={handleSubmit} id="search-form">
          <div className="search-big">
            <span style={{ fontSize: '1.3rem' }}>🔍</span>
            <input
              id="search-main-input"
              type="search"
              placeholder="Try 'AI', 'action movies', 'true crime'..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              aria-label="Search all content"
            />
            <button
              type="submit"
              className="btn btn-primary"
              id="search-submit-btn"
              style={{ flexShrink: 0, padding: '8px 20px', fontSize: '0.85rem' }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Tags */}
        {!searched && (
          <div style={{ marginTop: '32px' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Quick searches
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
              {QUICK_TAGS.map(tag => (
                <button
                  key={tag}
                  id={`quick-tag-${tag.toLowerCase().replace(' ', '-')}`}
                  className="onboarding-chip"
                  onClick={() => { setQuery(tag); doSearch(tag); }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '40px 0' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ width: '200px', height: '280px', borderRadius: '16px' }} />
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 style={{ marginBottom: '8px' }}>No results found</h3>
          <p>Try a different search term or browse the <a href="/explore" style={{ color: 'var(--accent-primary)' }}>Explore page</a>.</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div id="search-results">
          <p className="search-results-info">
            Found <strong style={{ color: 'var(--text-primary)' }}>{results.length}</strong> results for "<strong style={{ color: 'var(--accent-primary)' }}>{query}</strong>"
            across {Object.keys(grouped).length} content types
          </p>

          {Object.entries(grouped).map(([domain, items]) => (
            <section key={domain} className="section" id={`search-results-${domain}`}>
              <div className="section-header">
                <h2 className="section-title">
                  <span className="section-emoji">{DOMAIN_ICONS[domain]}</span>
                  {domain.charAt(0).toUpperCase() + domain.slice(1)}
                  <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
                    ({items.length})
                  </span>
                </h2>
              </div>
              <div className="content-grid" id={`search-grid-${domain}`}>
                {items.map(item => (
                  <ContentCard key={item.id} item={item} onPlay={handlePlay} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
