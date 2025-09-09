# NewsPlay Backend API

A robust Node.js backend API for the NewsPlay AI-powered visual storytelling platform.

## 🚀 Features

- **AI Integration**: OpenAI GPT-4 for storyboard generation and prompt enhancement
- **Image Generation**: Runware API integration for AI-generated images
- **User Management**: JWT-based authentication and user profiles
- **Brand Management**: Customizable brand profiles with visual styles and color themes
- **Story Management**: Complete CRUD operations for storyboards
- **In-Memory Storage**: Development-ready storage (easily replaceable with database)
- **Rate Limiting**: Built-in protection against API abuse
- **Security**: Helmet, CORS, and input validation

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API key
- Runware API key (optional for development)

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   RUNWARE_API_KEY=your_runware_api_key_here
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Stories
- `GET /api/stories` - List stories
- `GET /api/stories/:id` - Get specific story
- `POST /api/stories` - Create new story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `POST /api/stories/:id/regenerate-image` - Regenerate specific image

### Brand Profiles
- `GET /api/brands` - List brand profiles
- `GET /api/brands/:id` - Get specific brand profile
- `POST /api/brands` - Create brand profile
- `PUT /api/brands/:id` - Update brand profile
- `DELETE /api/brands/:id` - Delete brand profile
- `GET /api/brands/default` - Get default brand profile
- `POST /api/brands/:id/set-default` - Set brand as default

### AI Services
- `POST /api/ai/generate-storyboard` - Generate storyboard from article
- `POST /api/ai/enhance-prompt` - Enhance image prompt
- `POST /api/ai/generate-image` - Generate single image
- `POST /api/ai/generate-multiple-images` - Generate multiple images
- `GET /api/ai/models` - Get available AI models
- `POST /api/ai/test-connection` - Test AI service connections

### System
- `GET /health` - Health check endpoint
- `GET /` - API documentation

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `RUNWARE_API_KEY` | Runware API key | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Visual Styles
- `cinematic` - Movie-like quality, dramatic composition
- `realistic` - Photorealistic, professional photography
- `sketch` - Hand-drawn, artistic lines, pencil style
- `comic` - Comic book style, bold lines, pop art
- `watercolor` - Soft textures, artistic brushstrokes
- `vector` - Clean, geometric, no noise
- `minimalist` - Clean lines, simple composition
- `illustrated` - Digital illustration, vibrant colors

### Color Themes
- `minimalistic` - Clean whites, soft grays
- `playful` - Bright, cheerful, energetic colors
- `modern` - Contemporary, balanced, professional
- `futuristic` - High-tech, cool tones, sleek
- `elegant` - Sophisticated, refined, luxury
- `rustic` - Natural, warm, organic tones
- `vibrant` - Bold, high contrast, dynamic
- `monochrome` - Black, white, grayscale tones

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer your_jwt_token_here
```

## 📝 Example Usage

### Create a Story
```bash
curl -X POST http://localhost:3001/api/stories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "original_text": "Breaking news about AI technology...",
    "visual_style": "realistic",
    "color_theme": "modern"
  }'
```

### Generate Image
```bash
curl -X POST http://localhost:3001/api/ai/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A bustling modern city street with dramatic lighting",
    "options": {
      "width": 1024,
      "height": 1024
    }
  }'
```

## 🗄️ Storage

Currently uses in-memory storage for development. To replace with a database:

1. Create database models in `src/models/`
2. Replace `src/storage/inMemoryStorage.js` with database operations
3. Update all route handlers to use the new storage layer

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use a proper database (PostgreSQL recommended)
3. Set up proper logging and monitoring
4. Configure reverse proxy (nginx)
5. Use PM2 or similar for process management
6. Set up SSL certificates

## 🐛 Development

- Uses nodemon for auto-restart during development
- Comprehensive error handling and logging
- Input validation with express-validator
- Rate limiting to prevent abuse
- CORS configured for frontend integration

## 📄 License

MIT License - see LICENSE file for details
