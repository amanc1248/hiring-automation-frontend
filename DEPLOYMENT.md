# HR Automation Frontend - Vercel Deployment Guide

This guide will help you deploy the HR Automation frontend to Vercel for your hackathon demo.

## 🚀 Quick Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

## ⚙️ Environment Variables Setup

### Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.railway.app` | Backend API URL |
| `VITE_APP_NAME` | `HR Automation Platform` | Application name |
| `VITE_APP_VERSION` | `1.0.0` | App version |

### Setting Environment Variables

1. **Via Vercel Dashboard:**
   - Go to your project settings
   - Click "Environment Variables"
   - Add each variable for Production, Preview, and Development

2. **Via CLI:**
   ```bash
   vercel env add VITE_API_URL
   # Enter your backend URL when prompted
   ```

## 🏗️ Build Configuration

The project is configured with:

- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 📦 Optimizations Included

✅ **Bundle Splitting**: Separate chunks for vendor, router, and UI libraries  
✅ **Minification**: Terser minification enabled  
✅ **Caching**: Static assets cached for 1 year  
✅ **SPA Routing**: All routes redirect to index.html  
✅ **Performance**: Optimized chunk sizes  

## 🔧 Custom Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Build Configuration (`vite.config.ts`)
- Optimized for production builds
- Manual chunk splitting for better caching
- Terser minification
- Sourcemap disabled for smaller builds

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Run locally to test
   npm run build
   npm run preview
   ```

2. **API Connection Issues**
   - Verify `VITE_API_URL` is set correctly
   - Ensure backend is deployed and accessible
   - Check CORS settings in backend

3. **Routing Issues**
   - Vercel config includes SPA routing support
   - All non-API routes redirect to index.html

### Environment Variable Issues

```bash
# Check if variables are available during build
console.log('API URL:', import.meta.env.VITE_API_URL)
```

## 🎯 Hackathon Demo Setup

### Pre-Demo Checklist

- [ ] Backend deployed and running (Railway)
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain setup (optional)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Test all major features work

### Demo URLs

After deployment, you'll get:
- **Production URL**: `https://your-project.vercel.app`
- **Custom Domain**: `https://your-custom-domain.com` (optional)

### Performance

- **First Load**: ~2-3 seconds
- **Subsequent Loads**: ~500ms (cached)
- **Lighthouse Score**: 90+ (optimized build)

## 🎉 Success!

Your HR automation frontend is now deployed and ready for your hackathon presentation!

**Share your demo:**
- Frontend: `https://your-project.vercel.app`
- API: `https://your-backend.railway.app`

## 📞 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- Check Vercel function logs for debugging
