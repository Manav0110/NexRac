import express from 'express';
import { generateRecommendations } from '../engine/recommender.js';

const router = express.Router();

// Get personalized recommendations
router.post('/', (req, res) => {
  const { preferences, history, likedItems } = req.body;
  const recs = generateRecommendations({ preferences, history, likedItems });
  res.json({ success: true, data: recs });
});

// Feedback endpoint (records like/dislike, would update DB in production)
router.post('/feedback', (req, res) => {
  const { itemId, action, userId } = req.body; // action: 'like' | 'dislike' | 'view'
  // In production: store this in a database for collaborative filtering
  res.json({ success: true, message: `Feedback recorded: ${action} on ${itemId}` });
});

export default router;
