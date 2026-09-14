import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB, getDbStatus } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import recRoutes from './routes/recRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';
import dnaRoutes from './routes/dnaRoutes.js';
import friendsRoutes from './routes/friendsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id']
}));
app.use(express.json());
app.use(morgan('dev'));

// Connect Database
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'AETHER Cinematic Discovery Engine',
    version: '1.0.0',
    db: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/recommendations', recRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/movie-dna', dnaRoutes);
app.use('/api/friends', friendsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[AETHER Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected cinematic anomaly occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`[AETHER Server] Running at http://localhost:${PORT}`);
});
