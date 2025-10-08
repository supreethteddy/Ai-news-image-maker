# NewsPlay - AI-Powered Visual Storyboard Creator

NewsPlay is an innovative AI-powered application that transforms text articles into stunning visual storyboards with AI-generated images. Built with React, Node.js, and integrated with Ideogram AI and Gemini AI for a seamless content creation experience.

## 🚀 Features

- **AI-Powered Storyboard Generation**: Transform any text article into a visual storyboard
- **Real AI Image Generation**: High-quality images generated using Ideogram AI
- **Brand Consistency**: Maintain character consistency and visual styles across all images
- **Modern UI**: Clean, intuitive interface built with React and Tailwind CSS
- **Real-time Generation**: Watch as your storyboard comes to life with live image generation
- **Authentication System**: Secure user authentication with JWT tokens
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Radix UI** for components
- **Framer Motion** for animations
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **JWT Authentication**
- **CORS** enabled for cross-origin requests
- **Helmet** for security headers
- **Morgan** for request logging

### AI Services
- **Ideogram AI** for image generation
- **Gemini AI** for text processing and storyboard creation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Ideogram AI API key
- Gemini AI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/supreethteddy/Ai-news-image-maker.git
   cd Ai-news-image-maker
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   IDEOGRAM_API_KEY=your_ideogram_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Start the development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: https://ai-news-image-maker.onrender.com

## 🎯 Usage

1. **Create a Storyboard**
   - Navigate to "Create Storyboard"
   - Enter your article text
   - Select visual style and color theme preferences
   - Click "Generate Visual Storyboard"

2. **View Generated Content**
   - Watch as AI generates storyboard text
   - See images being created in real-time
   - Edit and regenerate individual parts as needed

3. **Manage Storyboards**
   - View all your created storyboards
   - Edit existing storyboards
   - Download or share your visual stories

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Storyboards
- `GET /api/stories` - Get user's storyboards
- `POST /api/stories` - Create new storyboard
- `PUT /api/stories/:id` - Update storyboard
- `DELETE /api/stories/:id` - Delete storyboard

### AI Services
- `POST /api/ai/generate-storyboard` - Generate storyboard from text
- `POST /api/ai/generate-image` - Generate single image
- `POST /api/ai/enhance-prompt` - Enhance image prompt

### Brand Management
- `GET /api/brands` - Get brand profiles
- `POST /api/brands` - Create brand profile
- `PUT /api/brands/:id` - Update brand profile

## 🎨 Customization

### Visual Styles
- **Realistic**: Photorealistic images
- **Cartoon**: Animated/cartoon style
- **Comic**: Comic book style
- **Minimalist**: Clean, simple designs

### Color Themes
- **Modern**: Contemporary color palettes
- **Vintage**: Retro color schemes
- **Monochrome**: Black and white
- **Vibrant**: Bright, energetic colors

## 🔒 Security

- JWT-based authentication
- Secure API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization

## 📱 Responsive Design

NewsPlay is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform

### Backend (Railway/Heroku)
1. Set environment variables in your hosting platform
2. Deploy the `backend` folder
3. Ensure the backend URL is updated in frontend configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ideogram AI** for powerful image generation capabilities
- **Gemini AI** for intelligent text processing
- **React** and **Vite** for the modern frontend framework
- **Express.js** for the robust backend API
- **Tailwind CSS** for beautiful styling

## 📞 Support

For support, email support@newsplay.com or create an issue in this repository.

---

**Built with ❤️ by StaiblTech**