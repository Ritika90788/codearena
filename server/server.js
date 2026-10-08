import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import featureRoutes from './routes/featureRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local development
      }
    },
    credentials: true,
  })
);

// Body parser & Cookie parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'CodeArena Core API',
    version: '1.0.0',
    db: 'connected',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`,
  });
});

// Serve static frontend assets from client build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// For SPA client routing: send index.html for any remaining GET requests
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CodeArena Server Running</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: system-ui, -apple-system, sans-serif; background-color: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box;">
        <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; max-width: 520px; width: 100%; text-align: center; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🚀</div>
          <h2 style="margin: 0 0 12px; color: #f43f5e;">CodeArena Backend is Live!</h2>
          <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 20px;">
            The Node.js API server is running and connected to MongoDB Atlas.
          </p>
          <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; text-align: left; font-size: 0.85rem;">
            <p style="margin: 0 0 8px; font-weight: 600; color: #e2e8f0;">⚠️ Frontend (client/dist) build nahi mila:</p>
            <p style="margin: 0 0 12px; color: #94a3b8;">Render Dashboard ke <b>Settings</b> mein jakar <b>Build Command</b> ko change karein:</p>
            <code style="display: block; background: #1e293b; color: #38bdf8; padding: 10px; border-radius: 6px; font-family: monospace; word-break: break-all;">npm --prefix client install && npm --prefix client run build && npm --prefix server install</code>
          </div>
          <p style="margin-top: 20px; font-size: 0.85rem; color: #64748b;">
            Health check: <a href="/api/health" style="color: #38bdf8;">/api/health</a>
          </p>
        </div>
      </body>
    </html>
  `);
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ======================================================
     🚀 CodeArena Server Running in ${process.env.NODE_ENV || 'development'} mode
     📡 Endpoint: http://localhost:${PORT}
     🩺 Healthcheck: http://127.0.0.1:${PORT}/api/health
  ======================================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Keep server alive in dev
});

export default app;
