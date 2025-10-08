import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

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

// CORS configuration
const defaultAllowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const envFrontendUrl = process.env.FRONTEND_URL || 'https://ai-news-image-maker.vercel.app';
const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, envFrontendUrl]));

app.use(cors({
  origin: allowedOrigins,
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NewsPlay Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

export default app;
