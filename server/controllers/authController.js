import bcrypt from 'bcryptjs';
import { memoryDb } from '../config/db.js';
import { signToken } from '../middleware/auth.js';

export const authController = {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
      }

      const existing = memoryDb.findOne('users', { email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = memoryDb.insert('users', {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        createdAt: new Date().toISOString()
      });

      const token = signToken({ id: user._id, username: user.username, email: user.email });

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password required.' });
      }

      const user = memoryDb.findOne('users', { email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = signToken({ id: user._id, username: user.username, email: user.email });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async googleLogin(req, res) {
    try {
      const { email, name, avatar, googleId } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Google authentication requires email.' });
      }

      let user = memoryDb.findOne('users', { email: email.toLowerCase() });
      if (!user) {
        const username = name || email.split('@')[0];
        user = memoryDb.insert('users', {
          username,
          email: email.toLowerCase(),
          googleId: googleId || `g_${Date.now()}`,
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
          createdAt: new Date().toISOString()
        });
      }

      const token = signToken({ id: user._id, username: user.username, email: user.email, isGoogle: true });

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isGoogle: true
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async guest(req, res) {
    const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    const token = signToken({ id: guestId, username: 'Cinematic Explorer', isGuest: true });
    res.json({
      success: true,
      token,
      user: {
        id: guestId,
        username: 'Cinematic Explorer',
        isGuest: true,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AetherGuest'
      }
    });
  },

  async getProfile(req, res) {
    const userId = req.user.id;
    const watched = memoryDb.find('watched', { userId });
    const watchlist = memoryDb.find('watchlist', { userId });
    const ratings = memoryDb.find('ratings', { userId });

    res.json({
      success: true,
      user: {
        id: userId,
        username: req.user.username || 'Cinematic Explorer',
        isGuest: !!req.user.isGuest,
        stats: {
          watchedCount: watched.length,
          watchlistCount: watchlist.length,
          ratingsCount: ratings.length
        }
      }
    });
  }
};
