import express from 'express';
import { recController } from '../controllers/recController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/personalized', authMiddleware, recController.getPersonalizedFeeds);
router.get('/item/:id', recController.getItemRecommendations);

export default router;
