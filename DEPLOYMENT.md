# 🚀 Netlify Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Files Ready for Deployment:
- [x] `netlify.toml` - Netlify configuration
- [x] `.env.production` - Production environment variables
- [x] `package.json` - Build scripts configured
- [x] All components and pages working locally

### 🔧 Environment Variables to Set in Netlify:
```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_SUPABASE_URL=https://tofoatpggdudjvgoixwp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZm9hdHBnZ2R1ZGp2Z29peHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyOTE5NTEsImV4cCI6MjA2NDg2Nzk1MX0.szgJXH6rKE7DY4uB6SvITfNQXJeOjJUB5lZQGsiqIGs
```

## 🚀 Deployment Steps

### Method 1: Netlify Drop (Quick & Easy)

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Go to Netlify:**
   - Visit: https://netlify.com
   - Scroll to "Deploy manually" section

3. **Drag & Drop:**
   - Drag the `dist` folder to the drop zone
   - Wait for deployment to complete

4. **Your app is live!**
   - You'll get a URL like: `https://amazing-app-123456.netlify.app`

### Method 2: Git-based Deployment (Recommended for ongoing development)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

4. **Add environment variables:**
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.production`

5. **Deploy:**
   - Click "Deploy site"
   - Automatic deployments on every git push

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails:** Check Node version (should be 18+)
2. **404 on refresh:** Netlify.toml redirects should fix this
3. **Environment variables:** Make sure all VITE_ prefixed vars are set
4. **API issues:** Check Supabase URLs and keys

### Build Commands:
```bash
# Development build
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## 📱 Features Included:
- ✅ Patient Management
- ✅ Lab Scripts with AI Enhancement
- ✅ Manufacturing Queue
- ✅ Report Cards System
- ✅ PWA Support
- ✅ Responsive Design
- ✅ Supabase Integration

## 🌐 Post-Deployment:
1. Test all functionality on live site
2. Share URL with team/clients
3. Set up custom domain (optional)
4. Monitor performance and usage
