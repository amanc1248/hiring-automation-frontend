#!/bin/bash

# HR Automation Frontend - Vercel Deployment Script
# This script helps automate the deployment process

echo "🚀 HR Automation Frontend - Vercel Deployment"
echo "=============================================="
echo

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in frontend directory. Please run from frontend folder."
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔍 Checking project setup..."

# Check if build works
echo "🏗️  Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix build errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Check environment variables
echo "⚙️  Environment Variables Setup"
echo "   Make sure to set these in Vercel Dashboard:"
echo "   - VITE_API_URL (your backend URL)"
echo "   - VITE_APP_NAME (HR Automation Platform)"
echo

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "   This will deploy to production."
echo

read -p "Continue with deployment? (y/N): " confirm
if [[ $confirm =~ ^[Yy]$ ]]; then
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo
        echo "🎉 Deployment Successful!"
        echo "✅ Your HR Automation frontend is now live!"
        echo "📝 Don't forget to:"
        echo "   1. Set environment variables in Vercel Dashboard"
        echo "   2. Test all features work with your backend"
        echo "   3. Share your demo URL!"
        echo
    else
        echo "❌ Deployment failed. Check the errors above."
        exit 1
    fi
else
    echo "🛑 Deployment cancelled."
fi
