import express from 'express';
import { recController } from '../controllers/recController.js';
import { authenticateOptional } from '../middleware/auth.js';

const router = express.Router();

router.get('/personalized', authenticateOptional, recController.getPersonalizedFeeds);
router.get('/shuffle', authenticateOptional, recController.getShuffleFeed);
router.get('/genres', authenticateOptional, recController.getGenreHub);
router.get('/movie/:id', recController.getItemRecommendations);

export default router;
