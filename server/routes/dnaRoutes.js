import express from 'express';
import { dnaController } from '../controllers/dnaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, dnaController.getMovieDna);

export default router;
