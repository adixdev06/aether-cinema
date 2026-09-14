import express from 'express';
import { friendsController } from '../controllers/friendsController.js';
import { authenticateOptional } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateOptional, friendsController.getFriendsList);
router.post('/compare', authenticateOptional, friendsController.compareFriend);
router.post('/add', authenticateOptional, friendsController.addFriend);

export default router;
