import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ContentCard from '../components/ContentCard';

const DOMAINS = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'movies', label: 'Movies', icon: '🎬' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'podcasts', label: 'Podcasts', icon: '🎙️' },
  { id: 'videos', label: 'Videos', icon: '📹' },
  { id: 'news', label: 'News', icon: '📰' },
];

const SORT_OPTIONS = ['Rating', 'Year', 'Popularity'];

export default function Explore({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDomain = searchParams.get('domain') || 'all';

  const [activeDomain, setActiveDomain] = useState(initialDomain);
  const [sort, setSort] = useState('Rating');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveDomain(searchParams.get('domain') || 'all');
  }, [searchParams]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const url = activeDomain === 'all' ? '/api/content/all' : `/api/content/${activeDomain}`;
        const res = await axios.get(url);
        let data = res.data.data;

        // Sort
        if (sort === 'Rating') data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sort === 'Year') data = [...data].sort((a, b) => (b.year || 0) - (a.year || 0));
        else if (sort === 'Popularity') data = [...data].sort((a, b) => {
          const ap = a.plays || a.views || a.listeners || 0;
          const bp = b.plays || b.views || b.listeners || 0;
          return (typeof bp === 'number' ? bp : 0) - (typeof ap === 'number' ? ap : 0);
        });

        setContent(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [activeDomain, sort]);

  const handleDomainChange = (domain) => {
    setActiveDomain(domain);
    setSearchParams(domain === 'all' ? {} : { domain });
  };

  const handlePlay = (item) => {
    showToast(`Now viewing: ${item.title || item.name}`, '▶');
  };

  return (
    <div className="page-container animate-fadeIn">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          🔭 Explore Content
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Browse across all content domains in one unified place.
        </p>
      </div>

      {/* Domain Tabs */}
      <div className="domain-tabs" id="explore-domain-tabs">
        {DOMAINS.map(d => (
          <button
            key={d.id}
            id={`domain-tab-${d.id}`}
            className={`domain-tab ${activeDomain === d.id ? 'active' : ''}`}
            data-domain={d.id}
            onClick={() => handleDomainChange(d.id)}
            aria-pressed={activeDomain === d.id}
          >
            {d.icon} {d.label}
          </button>
        ))}

        {/* Sort */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          {SORT_OPTIONS.map(o => (
            <button
              key={o}
              id={`sort-${o.toLowerCase()}`}
              className={`domain-tab ${sort === o ? 'active' : ''}`}
              data-domain="all"
              onClick={() => setSort(o)}
              style={{ fontSize: '0.78rem' }}
            >
              {o === 'Rating' ? '⭐' : o === 'Year' ? '📅' : '🔥'} {o}
            </button>
          ))}
        </div>
      </div>

      {/* Content count */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
        {loading ? 'Loading...' : `${content.length} items found`}
        {activeDomain !== 'all' && ` in ${activeDomain}`}
      </p>

      {/* Content Grid */}
      {loading ? (
        <div className="content-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : content.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔭</div>
          <p>No content found.</p>
        </div>
      ) : (
        <div
          className={`content-grid ${activeDomain === 'news' ? 'content-grid--news' : ''}`}
          id="explore-grid"
        >
          {content.map(item => (
            <ContentCard key={item.id} item={item} onPlay={handlePlay} />
          ))}
        </div>
      )}
    </div>
  );
}
