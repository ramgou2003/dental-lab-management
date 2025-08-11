# 🚀 Production Deployment Guide

## Overview

This guide covers deploying your dental lab management application to production with feature flags, testing, and CI/CD pipeline.

## 📋 Feature Flag System

### Available Deployment Modes

1. **Minimal Production** - Only core features
2. **Lead Management** - Core + lead management features  
3. **Full Production** - All features enabled

### Feature Flags Configuration

The application uses environment variables to control feature visibility:

```bash
# Core Features (Always recommended)
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_PATIENTS=true
VITE_FEATURE_SETTINGS=true
VITE_FEATURE_PROFILE=true

# Lead Management Features
VITE_FEATURE_LEAD_IN=true/false
VITE_FEATURE_APPOINTMENTS=true/false
VITE_FEATURE_CONSULTATION=true/false

# Lab Operations Features
VITE_FEATURE_LAB=true/false
VITE_FEATURE_REPORT_CARDS=true/false
VITE_FEATURE_MANUFACTURING=true/false
VITE_FEATURE_APPLIANCE_DELIVERY=true/false

# Admin Features
VITE_FEATURE_USER_MANAGEMENT=true/false

# Public Features
VITE_FEATURE_PUBLIC_PATIENT_FORM=true/false
VITE_FEATURE_PUBLIC_PATIENT_PACKET=true/false
```

## 🎯 Deployment Strategies

### 1. Minimal Production Deployment

Perfect for initial launch with core functionality:

```bash
# Copy .env.production.minimal to Vercel environment variables
VITE_FEATURE_DASHBOARD=true
VITE_FEATURE_PATIENTS=true
VITE_FEATURE_SETTINGS=true
VITE_FEATURE_PROFILE=true
VITE_FEATURE_PUBLIC_PATIENT_FORM=true
VITE_FEATURE_PUBLIC_PATIENT_PACKET=true
# All other features = false
```

**Features included:**
- ✅ Dashboard
- ✅ Patient Management
- ✅ Settings
- ✅ User Profile
- ✅ Public Patient Forms

### 2. Lead Management Deployment

Add lead management capabilities:

```bash
# Copy .env.production.leadmanagement to Vercel environment variables
# Includes minimal features plus:
VITE_FEATURE_LEAD_IN=true
VITE_FEATURE_APPOINTMENTS=true
VITE_FEATURE_CONSULTATION=true
VITE_FEATURE_USER_MANAGEMENT=true
```

**Additional features:**
- ✅ Lead tracking and management
- ✅ Appointment scheduling
- ✅ Consultation management
- ✅ User management

### 3. Full Production Deployment

All features enabled:

```bash
# Copy .env.production to Vercel environment variables
# All features = true
```

## 🔧 Vercel Deployment Setup

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Environment Variables

In Vercel project settings, add environment variables based on your chosen deployment mode:

**Required for all modes:**
```bash
VITE_SUPABASE_URL=https://tofoatpggdudjvgoixwp.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

**Feature flags** (choose your deployment mode from above)

### 3. Domain Configuration

1. Add your custom domain in Vercel project settings
2. Configure DNS records as instructed by Vercel
3. Enable HTTPS (automatic with Vercel)

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run with coverage report
```

### E2E Tests
```bash
npm run test:e2e      # Run Playwright tests
npm run test:e2e:ui   # Run with UI mode
```

### Testing Feature Flags
```bash
# Test minimal production mode
VITE_FEATURE_LAB=false npm run test

# Test full production mode  
VITE_FEATURE_LAB=true npm run test
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The pipeline automatically:

1. **Tests** - Runs unit tests, E2E tests, and linting
2. **Security** - Performs security audits
3. **Deploy Preview** - Creates preview deployments for PRs
4. **Deploy Staging** - Deploys `develop` branch with lead management features
5. **Deploy Production** - Deploys `main` branch with full features

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
```

## 📈 Gradual Feature Rollout

### Phase 1: Core Features (Week 1-2)
Deploy with minimal configuration to validate core functionality.

### Phase 2: Lead Management (Week 3-4)
Enable lead management features after core validation.

### Phase 3: Lab Operations (Week 5-8)
Gradually enable lab features:
1. Lab scripts
2. Report cards
3. Manufacturing
4. Appliance delivery

### Phase 4: Full Production (Week 9+)
Enable all features for complete functionality.

## 🔍 Monitoring & Maintenance

### Health Checks
- Monitor Vercel deployment status
- Check Supabase database performance
- Monitor API usage (OpenRouter, Gemini)

### Feature Flag Management
- Update environment variables in Vercel to enable/disable features
- Test new features in staging before production
- Use preview deployments for feature validation

### Performance Monitoring
- Monitor Core Web Vitals in Vercel Analytics
- Track user engagement with enabled features
- Monitor error rates and performance metrics

## 🚨 Rollback Strategy

### Quick Rollback
1. Disable problematic features via environment variables
2. Redeploy with previous stable configuration
3. No code changes required

### Emergency Rollback
1. Revert to previous Git commit
2. Trigger new deployment
3. Restore from Supabase backup if needed

## 📞 Support & Troubleshooting

### Common Issues

1. **Feature not showing**: Check environment variable spelling and values
2. **Build failures**: Verify all dependencies are installed
3. **API errors**: Validate API keys and endpoints
4. **Database issues**: Check Supabase connection and permissions

### Getting Help

1. Check deployment logs in Vercel dashboard
2. Review test results in GitHub Actions
3. Monitor application errors in browser console
4. Check Supabase logs for database issues

## 🎉 Next Steps

After successful deployment:

1. **User Training** - Train staff on enabled features
2. **Data Migration** - Import existing patient/lead data
3. **Integration Setup** - Configure external integrations
4. **Backup Strategy** - Set up automated backups
5. **Monitoring** - Implement comprehensive monitoring
6. **Feature Planning** - Plan next feature rollouts
