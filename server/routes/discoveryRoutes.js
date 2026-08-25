import express from 'express';
import { discoveryController } from '../controllers/discoveryController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/moods', discoveryController.getMoods);
router.get('/mood/:moodId', authMiddleware, discoveryController.getMoodMedia);
router.post('/surprise-me', authMiddleware, discoveryController.surpriseMe);
router.get('/universe-graph', discoveryController.getUniverseGraph);

export default router;
