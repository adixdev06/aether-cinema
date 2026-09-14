import express from 'express';
import { movieController } from '../controllers/movieController.js';

const router = express.Router();

router.get('/trending', movieController.getTrending);
router.get('/popular', movieController.getPopular);
router.get('/top-rated', movieController.getTopRated);
router.get('/universes', movieController.getUniverses);
router.get('/search', movieController.search);
router.get('/filter', movieController.filter);
router.get('/streams', movieController.getStreams);
router.get('/stream/:id', movieController.getStreamDetails);
router.get('/:id', movieController.getDetails);

export default router;
