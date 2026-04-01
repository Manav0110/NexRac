/**
 * Real API Integration Routes
 * ─────────────────────────────────────────────────────────────
 * Music & Podcasts → iTunes Search API (FREE, no key required)
 * Movies          → TMDB API (free key from themoviedb.org)
 * Videos          → YouTube Data API v3 (free key from Google)
 * News            → NewsAPI (free key from newsapi.org)
 * ─────────────────────────────────────────────────────────────
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

// ── MUSIC (iTunes — NO API KEY NEEDED) ─────────────────────────
router.get('/music', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Missing query' });
  try {
    const resp = await axios.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=8&entity=song`
    );
    const tracks = resp.data.results.map(t => ({
      id: String(t.trackId),
      title: t.trackName,
      artist: t.artistName,
      album: t.collectionName,
      duration: formatMs(t.trackTimeMillis),
      image: t.artworkUrl100?.replace('100x100', '400x400'),
      previewUrl: t.previewUrl,   // 30-second audio preview
      itunesUrl: t.trackViewUrl,
      genre: [t.primaryGenreName],
      domain: 'music',
      year: new Date(t.releaseDate).getFullYear(),
      rating: 4.5,
    }));
    res.json({ success: true, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PODCASTS (iTunes — NO API KEY NEEDED) ──────────────────────
router.get('/podcasts', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Missing query' });
  try {
    const resp = await axios.get(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=podcast&limit=8&entity=podcast`
    );
    const podcasts = resp.data.results.map(p => ({
      id: String(p.collectionId),
      title: p.collectionName,
      host: p.artistName,
      genre: p.genres || [],
      image: p.artworkUrl600 || p.artworkUrl100?.replace('100x100', '600x600'),
      itunesUrl: p.collectionViewUrl,
      feedUrl: p.feedUrl,
      domain: 'podcasts',
      trackCount: p.trackCount,
      rating: 4.6,
      country: p.country,
    }));
    res.json({ success: true, data: podcasts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PODCAST EPISODES (iTunes) ───────────────────────────────────
router.get('/podcasts/episodes', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, error: 'Missing podcast id' });
  try {
    const resp = await axios.get(
      `https://itunes.apple.com/lookup?id=${id}&media=podcast&entity=podcastEpisode&limit=5`
    );
    const episodes = resp.data.results
      .filter(e => e.wrapperType === 'podcastEpisode')
      .map(e => ({
        id: String(e.trackId),
        title: e.trackName,
        duration: formatMs(e.trackTimeMillis),
        episodeUrl: e.episodeUrl,
        description: e.description?.substring(0, 200) + '...',
        publishedAt: e.releaseDate,
        previewUrl: e.episodeUrl,
      }));
    res.json({ success: true, data: episodes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── MOVIES (TMDB API — free key from themoviedb.org) ───────────
router.get('/movies', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Missing query' });

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return res.json({ success: false, noKey: true, error: 'TMDB_API_KEY not configured' });

  try {
    const searchResp = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(q)}&page=1`
    );
    const movies = await Promise.all(
      searchResp.data.results.slice(0, 5).map(async (m) => {
        // Also fetch trailers
        let trailerKey = null;
        try {
          const vidResp = await axios.get(
            `https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${apiKey}`
          );
          const trailer = vidResp.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
          trailerKey = trailer?.key || null;
        } catch { /* no trailer */ }

        return {
          id: String(m.id),
          title: m.title,
          overview: m.overview,
          rating: m.vote_average,
          year: m.release_date?.split('-')[0],
          image: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
          genre: [],
          domain: 'movies',
          trailerKey,     // YouTube video ID for embedded trailer
          tmdbUrl: `https://www.themoviedb.org/movie/${m.id}`,
          imdbUrl: m.imdb_id ? `https://www.imdb.com/title/${m.imdb_id}` : null,
        };
      })
    );
    res.json({ success: true, data: movies });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── VIDEOS (YouTube Data API v3 — free Google key) ─────────────
router.get('/videos', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Missing query' });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return res.json({ success: false, noKey: true, error: 'YOUTUBE_API_KEY not configured' });

  try {
    const resp = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&maxResults=6&key=${apiKey}&type=video&relevanceLanguage=en`
    );
    const videos = resp.data.items.map(v => ({
      id: v.id.videoId,
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      description: v.snippet.description,
      image: v.snippet.thumbnails?.high?.url,
      youtubeId: v.id.videoId,
      youtubeUrl: `https://www.youtube.com/watch?v=${v.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${v.id.videoId}?autoplay=1`,
      publishedAt: v.snippet.publishedAt,
      domain: 'videos',
      rating: 4.5,
    }));
    res.json({ success: true, data: videos });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── NEWS (NewsAPI — free key from newsapi.org) ──────────────────
router.get('/news', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, error: 'Missing query' });

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return res.json({ success: false, noKey: true, error: 'NEWS_API_KEY not configured' });

  try {
    const resp = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&apiKey=${apiKey}&pageSize=6&sortBy=relevancy&language=en`
    );
    const articles = resp.data.articles.map((a, i) => ({
      id: `news-live-${i}`,
      title: a.title,
      source: a.source?.name,
      description: a.description,
      content: a.content,
      image: a.urlToImage,
      articleUrl: a.url,
      publishedAt: a.publishedAt,
      author: a.author,
      domain: 'news',
      rating: 4.5,
    }));
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── FULL DETAIL (unified endpoint) ─────────────────────────────
router.get('/detail', async (req, res) => {
  const { domain, query } = req.query;
  if (!domain || !query) return res.status(400).json({ success: false, error: 'Missing domain or query' });

  try {
    let result;
    switch (domain) {
      case 'music':    result = await fetchMusic(query); break;
      case 'podcasts': result = await fetchPodcast(query); break;
      case 'movies':   result = await fetchMovie(query); break;
      case 'videos':   result = await fetchVideo(query); break;
      case 'news':     result = await fetchNews(query); break;
      default: result = null;
    }
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── HELPERS ───────────────────────────────────────────────────
function formatMs(ms) {
  if (!ms) return 'N/A';
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function fetchMusic(q) {
  const resp = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=5&entity=song`);
  return resp.data.results.map(t => ({
    trackName: t.trackName, artistName: t.artistName,
    collectionName: t.collectionName, previewUrl: t.previewUrl,
    artworkUrl: t.artworkUrl100?.replace('100x100', '400x400'),
    trackViewUrl: t.trackViewUrl,
    releaseDate: t.releaseDate, primaryGenreName: t.primaryGenreName,
  }));
}

async function fetchPodcast(q) {
  const resp = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=podcast&limit=5`);
  return resp.data.results.map(p => ({
    collectionName: p.collectionName, artistName: p.artistName,
    artworkUrl: p.artworkUrl600, collectionViewUrl: p.collectionViewUrl,
    feedUrl: p.feedUrl, trackCount: p.trackCount, genres: p.genres,
  }));
}

async function fetchMovie(q) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return null;
  const resp = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(q)}`);
  const m = resp.data.results[0];
  if (!m) return null;
  const vidResp = await axios.get(`https://api.themoviedb.org/3/movie/${m.id}/videos?api_key=${key}`);
  const trailer = vidResp.data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  return { ...m, trailerKey: trailer?.key, posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null };
}

async function fetchVideo(q) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const resp = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&maxResults=3&key=${key}&type=video`);
  return resp.data.items.map(v => ({ videoId: v.id.videoId, title: v.snippet.title, channel: v.snippet.channelTitle, thumbnail: v.snippet.thumbnails?.high?.url }));
}

async function fetchNews(q) {
  const key = process.env.NEWS_API_KEY;
  if (!key) return null;
  const resp = await axios.get(`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&apiKey=${key}&pageSize=3&sortBy=relevancy`);
  return resp.data.articles.map(a => ({ title: a.title, source: a.source?.name, description: a.description, url: a.url, urlToImage: a.urlToImage }));
}

export default router;
