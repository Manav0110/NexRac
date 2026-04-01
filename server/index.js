import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import contentRoutes from './routes/content.js';
import recommendationRoutes from './routes/recommendations.js';
import realContentRoutes from './routes/realContent.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Content routes
app.use('/api/content', contentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/real', realContentRoutes);

app.get('/api/health', (req, res) => {
  const keys = {
    tmdb: !!process.env.TMDB_API_KEY,
    youtube: !!process.env.YOUTUBE_API_KEY,
    news: !!process.env.NEWS_API_KEY,
    jwt: !!process.env.JWT_SECRET,
  };
  res.json({
    status: 'ok',
    message: 'NexRec Recommendation API running',
    apiKeys: keys,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Auth API      → ✅ Active (JWT)`);
  console.log(`🎵 iTunes API    → FREE (music & podcasts)`);
  console.log(`🎬 TMDB API      → ${process.env.TMDB_API_KEY ? '✅ Active' : '❌ No key (add to .env)'}`);
  console.log(`📹 YouTube API   → ${process.env.YOUTUBE_API_KEY ? '✅ Active' : '❌ No key (add to .env)'}`);
  console.log(`📰 NewsAPI       → ${process.env.NEWS_API_KEY ? '✅ Active' : '❌ No key (add to .env)'}`);
});
