import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import axios from 'axios';

// Import routes
import storyRoutes from './routes/stories.js';
// import brandRoutes from './routes/brands.js'; // Removed - using user profiles only
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import characterRoutes from './routes/characters.js';
import uploadRoutes from './routes/upload.js';
import storyboardRoutes from './routes/storyboards.js';
import stylingTemplateRoutes from './routes/stylingTemplates.js';
import adminRoutes from './routes/admin.js';
import creditRoutes from './routes/credits.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration - supports both local and production
const allowedOrigins = [
  process.env.FRONTEND_URL,              // Production frontend URL
  'http://localhost:5173',               // Local dev (Vite default)
  'http://localhost:5174',               // Local dev (alternative port)
  'http://localhost:3000',               // Local dev (alternative)
  'https://ai-news-image-maker.vercel.app' // Vercel production (fallback)
].filter(Boolean); // Remove any undefined/null values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/stories', storyRoutes);
// app.use('/api/brands', brandRoutes); // Removed - using user profiles only
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/storyboards', storyboardRoutes);
app.use('/api/styling-templates', stylingTemplateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/credits', creditRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'NewsPlay API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      stories: '/api/stories',
      brands: '/api/brands',
      auth: '/api/auth',
      ai: '/api/ai',
      characters: '/api/characters',
      upload: '/api/upload',
      storyboards: '/api/storyboards',
      stylingTemplates: '/api/styling-templates',
      admin: '/api/admin'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Self-ping mechanism to prevent Render from sleeping
function startSelfPing() {
  // Get the server URL from environment or use localhost
  const serverUrl = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  const healthEndpoint = `${serverUrl}/health`;
  
  console.log(`🔄 Self-ping enabled: Pinging ${healthEndpoint} every 30 seconds`);
  
  // Ping immediately on start
  const ping = async () => {
    try {
      const response = await axios.get(healthEndpoint, {
        headers: {
          'User-Agent': 'NewsPlay-SelfPing/1.0'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.status === 200) {
        const data = response.data;
        console.log(`✅ Self-ping successful: ${data.status} (uptime: ${Math.floor(data.uptime)}s)`);
      } else {
        console.warn(`⚠️ Self-ping returned status: ${response.status}`);
      }
    } catch (error) {
      // Don't log errors in production to avoid spam
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Self-ping error:', error.message);
      }
    }
  };
  
  // Ping immediately
  ping();
  
  // Then ping every 30 seconds
  setInterval(ping, 30000); // 30 seconds = 30000ms
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NewsPlay Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  
  // Start self-ping to prevent Render from sleeping
  startSelfPing();
});

export default app;
