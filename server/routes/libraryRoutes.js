import express from 'express';
import { libraryController } from '../controllers/libraryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Watched
router.get('/watched', authMiddleware, libraryController.getWatched);
router.post('/watched', authMiddleware, libraryController.markWatched);
router.delete('/watched/:mediaId', authMiddleware, libraryController.unmarkWatched);

// Watchlist
router.get('/watchlist', authMiddleware, libraryController.getWatchlist);
router.post('/watchlist', authMiddleware, libraryController.addToWatchlist);
router.delete('/watchlist/:mediaId', authMiddleware, libraryController.removeFromWatchlist);

// Ratings
router.get('/ratings', authMiddleware, libraryController.getRatings);
router.post('/rate', authMiddleware, libraryController.rateItem);

export default router;
