# 🗄️ Database Setup Guide

## Overview

This guide helps you set up separate databases for testing and production environments using Supabase.

## 🎯 Database Strategy

### Environment Separation
- **Development**: Local development database (optional)
- **Testing/Staging**: Separate Supabase project for testing
- **Production**: Main Supabase project for production

### Benefits
- ✅ Safe testing without affecting production data
- ✅ Data isolation between environments
- ✅ Independent schema changes and migrations
- ✅ Separate user management and permissions

## 🚀 Setup Instructions

### Step 1: Create Supabase Projects

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**

2. **Create Testing Database:**
   - Click "New Project"
   - Name: `dental-lab-testing`
   - Choose region (same as production for consistency)
   - Set strong password
   - Wait for setup to complete

3. **Create Production Database:**
   - Click "New Project"
   - Name: `dental-lab-production`
   - Choose same region as testing
   - Set strong password
   - Wait for setup to complete

### Step 2: Configure Database Schemas

For each database (testing and production), run the following SQL:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (run this in both testing and production)
-- You can copy your existing schema from your current database

-- Example: Patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own patients" ON patients
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own patients" ON patients
  FOR UPDATE USING (auth.uid() = created_by);

-- Repeat for all your tables: leads, appointments, lab_scripts, etc.
```

### Step 3: Get Database Credentials

For each Supabase project:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xyz.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### Step 4: Configure GitHub Secrets

Add these secrets to your GitHub repository:

**Go to:** GitHub → Your Repository → Settings → Secrets and variables → Actions

#### Required Secrets:

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

# API Keys (shared across environments)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 5: Configure GitHub Variables

Add these repository variables for deployment control:

**Go to:** GitHub → Your Repository → Settings → Secrets and variables → Actions → Variables

```bash
# Controls which production environment to deploy
PRODUCTION_ENVIRONMENT=production-minimal
# Options: production-minimal, production-lead, production-full
```

## 🎛️ GitHub Control System

### Manual Deployment

You can now deploy to any environment manually:

1. **Go to:** GitHub → Your Repository → Actions
2. **Click:** "CI/CD Pipeline" workflow
3. **Click:** "Run workflow"
4. **Select:**
   - Environment: `testing`, `production-minimal`, `production-lead`, or `production-full`
   - Deploy to Vercel: `true`
5. **Click:** "Run workflow"

### Automatic Deployments

- **Push to `develop`** → Deploys to testing environment with testing database
- **Push to `main`** → Deploys to production environment with production database

### Change Production Environment

To change what gets deployed to production:

1. **Go to:** GitHub → Your Repository → Settings → Secrets and variables → Actions → Variables
2. **Edit:** `PRODUCTION_ENVIRONMENT`
3. **Set to:** `production-minimal`, `production-lead`, or `production-full`
4. **Next push to `main`** will use the new configuration

## 🔄 Environment Configurations

### Testing Environment
```json
{
  "database": "testing",
  "features": {
    "core": "enabled",
    "lead_management": "enabled", 
    "lab_operations": "disabled",
    "advanced_features": "disabled"
  }
}
```

### Production Minimal
```json
{
  "database": "production",
  "features": {
    "core": "enabled",
    "lead_management": "disabled",
    "lab_operations": "disabled", 
    "advanced_features": "disabled"
  }
}
```

### Production Lead Management
```json
{
  "database": "production",
  "features": {
    "core": "enabled",
    "lead_management": "enabled",
    "lab_operations": "disabled",
    "advanced_features": "disabled"
  }
}
```

### Production Full
```json
{
  "database": "production", 
  "features": {
    "core": "enabled",
    "lead_management": "enabled",
    "lab_operations": "enabled",
    "advanced_features": "enabled"
  }
}
```

## 🧪 Testing Strategy

### Database Testing

1. **Use testing database for:**
   - Feature development
   - Integration testing
   - User acceptance testing
   - Performance testing

2. **Use production database for:**
   - Live application
   - Production monitoring
   - Real user data

### Data Migration

When ready to go live:

1. **Export data from testing:**
   ```bash
   # Use Supabase CLI or dashboard export
   supabase db dump --db-url "your-testing-db-url"
   ```

2. **Import to production:**
   ```bash
   # Import to production database
   supabase db reset --db-url "your-production-db-url"
   ```

## 🔒 Security Best Practices

### Database Security

1. **Enable Row Level Security (RLS)** on all tables
2. **Create proper policies** for data access
3. **Use service role key** only in secure server environments
4. **Regularly rotate API keys**

### Environment Security

1. **Never commit database credentials** to code
2. **Use GitHub secrets** for sensitive data
3. **Limit access** to production secrets
4. **Monitor database access** logs

### Access Control

1. **Separate user accounts** for testing and production
2. **Use different API keys** for each environment
3. **Implement proper authentication** in application
4. **Regular security audits**

## 📊 Monitoring & Maintenance

### Database Monitoring

1. **Monitor database usage** in Supabase dashboard
2. **Set up alerts** for high usage or errors
3. **Regular backups** (automatic in Supabase)
4. **Performance monitoring**

### Environment Health

1. **Monitor deployment success** in GitHub Actions
2. **Check application health** after deployments
3. **Monitor feature flag usage**
4. **User feedback and error tracking**

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors:**
   - Check URL and API key in GitHub secrets
   - Verify database is running in Supabase

2. **Feature flags not working:**
   - Check environment configuration in `config/environments.json`
   - Verify GitHub variables are set correctly

3. **Deployment failures:**
   - Check GitHub Actions logs
   - Verify Vercel project IDs are correct

### Emergency Procedures

1. **Rollback deployment:**
   - Revert to previous commit
   - Trigger new deployment

2. **Database issues:**
   - Switch to backup database
   - Restore from Supabase backup

3. **Feature problems:**
   - Disable problematic features via GitHub variables
   - Redeploy with updated configuration
