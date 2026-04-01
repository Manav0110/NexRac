import express from 'express';
import { mockMusic, mockPodcasts, mockVideos, mockMovies, mockNews } from '../data/mockData.js';

const router = express.Router();

router.get('/music', (req, res) => {
  res.json({ success: true, data: mockMusic, total: mockMusic.length });
});

router.get('/podcasts', (req, res) => {
  res.json({ success: true, data: mockPodcasts, total: mockPodcasts.length });
});

router.get('/videos', (req, res) => {
  res.json({ success: true, data: mockVideos, total: mockVideos.length });
});

router.get('/movies', (req, res) => {
  res.json({ success: true, data: mockMovies, total: mockMovies.length });
});

router.get('/news', (req, res) => {
  res.json({ success: true, data: mockNews, total: mockNews.length });
});

router.get('/all', (req, res) => {
  const all = [
    ...mockMovies.slice(0, 3),
    ...mockMusic.slice(0, 3),
    ...mockPodcasts.slice(0, 3),
    ...mockVideos.slice(0, 3),
    ...mockNews.slice(0, 3),
  ];
  res.json({ success: true, data: all, total: all.length });
});

router.get('/search', (req, res) => {
  const { q = '' } = req.query;
  const query = q.toLowerCase();
  const all = [...mockMovies, ...mockMusic, ...mockPodcasts, ...mockVideos, ...mockNews];
  const results = all.filter(item => {
    const searchable = JSON.stringify(item).toLowerCase();
    return searchable.includes(query);
  });
  res.json({ success: true, data: results, total: results.length });
});

export default router;
