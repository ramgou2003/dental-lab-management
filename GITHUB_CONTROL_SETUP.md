# 🎛️ GitHub Control Setup Guide

## Overview

This guide shows you how to control your dental lab management application deployments entirely through GitHub, with separate databases for testing and production.

## 🚀 Quick Start

### 1. Run Setup Scripts

```bash
# See all available environments and options
node scripts/github-control.js all

# Get specific setup instructions
node scripts/github-control.js secrets    # GitHub secrets setup
node scripts/github-control.js variables  # GitHub variables setup
node scripts/github-control.js manual     # Manual deployment guide
```

### 2. Create Separate Databases

You need **TWO** Supabase projects:

1. **Testing Database** (`dental-lab-testing`)
   - For development, testing, and staging
   - Safe for experiments

2. **Production Database** (`dental-lab-production`)
   - For live application
   - Real user data

**Setup Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create both projects
3. Copy your existing schema to both databases
4. Get URL and anon key from each project

### 3. Configure GitHub Secrets

**Go to:** GitHub → Your Repository → Settings → Secrets and variables → Actions → Secrets

**Add these secrets:**

```bash
# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID_STAGING=your_staging_vercel_project_id
VERCEL_PROJECT_ID_PROD=your_production_vercel_project_id

# Testing Database
VITE_SUPABASE_URL_TEST=https://your-testing-project.supabase.co
VITE_SUPABASE_ANON_KEY_TEST=your_testing_anon_key

# Production Database
VITE_SUPABASE_URL_PROD=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY_PROD=your_production_anon_key

# API Keys (shared)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Configure GitHub Variables

**Go to:** GitHub → Your Repository → Settings → Secrets and variables → Actions → Variables

**Add this variable:**

```bash
PRODUCTION_ENVIRONMENT=production-minimal
```

**Options:**
- `production-minimal` - Only core features
- `production-lead` - Core + lead management
- `production-full` - All features enabled

## 🎯 How It Works

### Automatic Deployments

- **Push to `develop`** → Testing environment with testing database
- **Push to `main`** → Production environment with production database

### Manual Deployments

1. **Go to:** GitHub → Your Repository → Actions
2. **Click:** "CI/CD Pipeline" workflow
3. **Click:** "Run workflow"
4. **Select environment and deploy**

### Environment Control

Change production features by updating the `PRODUCTION_ENVIRONMENT` variable:

1. Go to GitHub repository settings
2. Navigate to Secrets and variables → Actions → Variables
3. Edit `PRODUCTION_ENVIRONMENT`
4. Set to: `production-minimal`, `production-lead`, or `production-full`
5. Next push to `main` uses new configuration

## 📊 Available Environments

### Testing Environment
```json
{
  "database": "testing",
  "features": {
    "dashboard": "✅ enabled",
    "patients": "✅ enabled", 
    "lead_management": "✅ enabled",
    "lab_operations": "❌ disabled",
    "advanced_features": "❌ disabled"
  }
}
```

### Production Minimal
```json
{
  "database": "production",
  "features": {
    "dashboard": "✅ enabled",
    "patients": "✅ enabled",
    "lead_management": "❌ disabled",
    "lab_operations": "❌ disabled",
    "advanced_features": "❌ disabled"
  }
}
```

### Production Lead Management
```json
{
  "database": "production", 
  "features": {
    "dashboard": "✅ enabled",
    "patients": "✅ enabled",
    "lead_management": "✅ enabled",
    "lab_operations": "❌ disabled",
    "advanced_features": "❌ disabled"
  }
}
```

### Production Full
```json
{
  "database": "production",
  "features": {
    "dashboard": "✅ enabled",
    "patients": "✅ enabled", 
    "lead_management": "✅ enabled",
    "lab_operations": "✅ enabled",
    "advanced_features": "✅ enabled"
  }
}
```

## 🔄 Deployment Workflow

### Phase 1: Initial Setup
1. Create testing and production databases
2. Configure GitHub secrets and variables
3. Deploy to testing environment first
4. Validate core functionality

### Phase 2: Testing
1. Push changes to `develop` branch
2. Automatic deployment to testing environment
3. Test new features safely
4. Validate with testing database

### Phase 3: Production Deployment
1. Merge `develop` to `main` branch
2. Automatic deployment to production
3. Uses production database
4. Features controlled by `PRODUCTION_ENVIRONMENT` variable

### Phase 4: Feature Rollout
1. Start with `production-minimal`
2. Upgrade to `production-lead` when ready
3. Finally enable `production-full`
4. Each change is just a variable update

## 🛠️ Advanced Control

### Custom Deployments

You can deploy any environment to any target:

```bash
# Deploy testing environment to production (for testing)
# Use manual deployment with "testing" environment

# Deploy production-full to staging (for validation)
# Use manual deployment with "production-full" environment
```

### Environment Modification

To add new environments, edit `config/environments.json`:

```json
{
  "environments": {
    "your-custom-env": {
      "name": "Custom Environment",
      "description": "Your custom configuration",
      "database": "testing",
      "features": {
        "VITE_FEATURE_DASHBOARD": "true",
        // ... your feature flags
      }
    }
  }
}
```

### Feature Flag Control

All feature flags are controlled via the environment configuration:

- `VITE_FEATURE_DASHBOARD` - Dashboard access
- `VITE_FEATURE_PATIENTS` - Patient management
- `VITE_FEATURE_LEAD_IN` - Lead tracking
- `VITE_FEATURE_APPOINTMENTS` - Appointment scheduling
- `VITE_FEATURE_CONSULTATION` - Consultation management
- `VITE_FEATURE_LAB` - Lab operations
- `VITE_FEATURE_REPORT_CARDS` - Report cards
- `VITE_FEATURE_MANUFACTURING` - Manufacturing queue
- `VITE_FEATURE_APPLIANCE_DELIVERY` - Appliance delivery
- `VITE_FEATURE_USER_MANAGEMENT` - User management
- `VITE_FEATURE_PUBLIC_PATIENT_FORM` - Public patient forms
- `VITE_FEATURE_PUBLIC_PATIENT_PACKET` - Public patient packets

## 🔒 Security & Best Practices

### Database Security
- ✅ Separate databases for testing and production
- ✅ Different API keys for each environment
- ✅ Row Level Security (RLS) enabled
- ✅ Proper authentication and authorization

### Deployment Security
- ✅ GitHub secrets for sensitive data
- ✅ Environment-specific configurations
- ✅ Automated testing before deployment
- ✅ Rollback capabilities

### Access Control
- ✅ GitHub repository access controls
- ✅ Vercel project separation
- ✅ Database access isolation
- ✅ API key rotation capabilities

## 📈 Monitoring & Maintenance

### Deployment Monitoring
- Monitor GitHub Actions for deployment status
- Check Vercel dashboard for application health
- Monitor Supabase dashboard for database performance

### Environment Health
- Test database connections regularly
- Monitor feature flag usage
- Track user adoption of new features
- Monitor error rates and performance

### Maintenance Tasks
- Regular database backups (automatic in Supabase)
- API key rotation
- Security updates
- Performance optimization

## 🆘 Troubleshooting

### Common Issues

**Deployment Fails:**
- Check GitHub Actions logs
- Verify all secrets are set correctly
- Ensure Vercel project IDs are correct

**Database Connection Errors:**
- Verify database URLs and keys in GitHub secrets
- Check Supabase project status
- Test database connection manually

**Feature Flags Not Working:**
- Check environment configuration in `config/environments.json`
- Verify GitHub variables are set correctly
- Check browser console for errors

**Wrong Database Being Used:**
- Check environment detection logic
- Verify hostname-based detection
- Check environment variable precedence

### Emergency Procedures

**Rollback Deployment:**
1. Revert to previous commit
2. Push to trigger new deployment
3. Or use manual deployment with previous environment

**Database Issues:**
1. Switch to backup database
2. Update GitHub secrets with backup credentials
3. Redeploy application

**Feature Problems:**
1. Update `PRODUCTION_ENVIRONMENT` variable to disable problematic features
2. Redeploy automatically or manually
3. Fix issues in testing environment first

## 📞 Support

For additional help:
1. Check deployment logs in GitHub Actions
2. Review application logs in Vercel dashboard
3. Monitor database logs in Supabase dashboard
4. Use browser developer tools for client-side issues

## 🎉 Next Steps

After setup:
1. Test the deployment workflow
2. Validate both databases work correctly
3. Practice manual deployments
4. Plan your feature rollout strategy
5. Train your team on the new workflow
