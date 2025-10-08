# Vercel Deployment Guide

## 🚀 Deploying to Vercel

This guide will help you deploy your full-stack application to Vercel with both frontend and backend in one repository.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Set up all required environment variables

## 🔧 Environment Variables

Set these in your Vercel dashboard under Project Settings > Environment Variables:

### Required Variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OPENAI_API_KEY=your_openai_api_key
IDEOGRAM_API_KEY=your_ideogram_api_key
SUPABASE_STORAGE_BUCKET=your_bucket_name
NODE_ENV=production
```

## 📁 Project Structure

```
your-project/
├── api/
│   └── index.js          # Vercel serverless function entry point
├── backend/
│   └── src/
│       └── app.js        # Your Express app
├── src/                  # Frontend React app
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

## 🚀 Deployment Steps

### 1. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Node.js project

### 2. Configure Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables
Add all the environment variables listed above in the Vercel dashboard.

### 4. Deploy
Click "Deploy" and Vercel will:
- Install dependencies
- Build your frontend
- Set up serverless functions for your API
- Deploy everything

## 🔄 How It Works

### Frontend (React + Vite)
- Built with Vite
- Served as static files
- Routes handled by React Router

### Backend (Express API)
- Converted to Vercel serverless functions
- All `/api/*` routes go to your Express app
- Handles authentication, AI generation, etc.

### API Routes
- `/api/auth/*` - Authentication
- `/api/storyboards/*` - Storyboard management
- `/api/ai/*` - AI image generation
- `/api/credits/*` - Credit system
- `/api/admin/*` - Admin functions

## 🛠 Local Development

For local development, use:
```bash
npm run dev:full
```

This runs both frontend and backend locally.

## 📝 Important Notes

1. **File Uploads**: Vercel has a 4.5MB limit for serverless functions
2. **Timeouts**: Serverless functions have a 30-second timeout
3. **Database**: Make sure your Supabase is properly configured
4. **Environment**: All environment variables must be set in Vercel dashboard

## 🔍 Troubleshooting

### Common Issues:
1. **Build Failures**: Check that all dependencies are in package.json
2. **API Errors**: Verify environment variables are set
3. **CORS Issues**: CORS is configured in the Express app
4. **File Upload Issues**: Check file size limits

### Debug Steps:
1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints individually
4. Check Supabase connection

## 🎉 After Deployment

Your app will be available at:
- **Frontend**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Vercel will automatically redeploy
3. Check the deployment logs for any issues

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test API endpoints
4. Check Supabase configuration
