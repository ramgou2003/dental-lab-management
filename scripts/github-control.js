#!/usr/bin/env node

/**
 * GitHub Control Script
 * Helps manage GitHub repository variables and secrets for deployment control
 */

const fs = require('fs');
const path = require('path');

function showEnvironmentOptions() {
  const configPath = path.join(__dirname, '..', 'config', 'environments.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  console.log('\n🎛️  GitHub Control System\n');
  console.log('Available production environments:\n');
  
  Object.entries(config.environments).forEach(([key, env]) => {
    if (key.startsWith('production-')) {
      console.log(`📋 ${key}`);
      console.log(`   Name: ${env.name}`);
      console.log(`   Description: ${env.description}`);
      console.log(`   Database: ${env.database}`);
      
      // Show enabled features
      const enabledFeatures = Object.entries(env.features)
        .filter(([_, enabled]) => enabled === 'true')
        .map(([feature, _]) => feature.replace('VITE_FEATURE_', '').toLowerCase());
      
      console.log(`   Features: ${enabledFeatures.join(', ')}\n`);
    }
  });
}

function generateGitHubSecretsGuide() {
  console.log('\n🔐 Required GitHub Secrets Setup\n');
  console.log('Go to: GitHub → Your Repository → Settings → Secrets and variables → Actions → Secrets\n');
  
  const secrets = [
    {
      category: 'Vercel Configuration',
      items: [
        { name: 'VERCEL_TOKEN', description: 'Get from https://vercel.com/account/tokens' },
        { name: 'VERCEL_ORG_ID', description: 'Get from Vercel project settings' },
        { name: 'VERCEL_PROJECT_ID_STAGING', description: 'Vercel project ID for staging/testing' },
        { name: 'VERCEL_PROJECT_ID_PROD', description: 'Vercel project ID for production' }
      ]
    },
    {
      category: 'Testing Database (Supabase)',
      items: [
        { name: 'VITE_SUPABASE_URL_TEST', description: 'Testing database URL (https://xyz.supabase.co)' },
        { name: 'VITE_SUPABASE_ANON_KEY_TEST', description: 'Testing database anon key' }
      ]
    },
    {
      category: 'Production Database (Supabase)',
      items: [
        { name: 'VITE_SUPABASE_URL_PROD', description: 'Production database URL (https://xyz.supabase.co)' },
        { name: 'VITE_SUPABASE_ANON_KEY_PROD', description: 'Production database anon key' }
      ]
    },
    {
      category: 'API Keys (Shared)',
      items: [
        { name: 'VITE_OPENROUTER_API_KEY', description: 'OpenRouter API key for AI features' },
        { name: 'VITE_GEMINI_API_KEY', description: 'Google Gemini API key' }
      ]
    }
  ];
  
  secrets.forEach(category => {
    console.log(`📁 ${category.category}:`);
    category.items.forEach(secret => {
      console.log(`   ${secret.name}`);
      console.log(`     ${secret.description}\n`);
    });
  });
}

function generateGitHubVariablesGuide() {
  console.log('\n📊 GitHub Repository Variables Setup\n');
  console.log('Go to: GitHub → Your Repository → Settings → Secrets and variables → Actions → Variables\n');
  
  console.log('Required Variables:\n');
  console.log('PRODUCTION_ENVIRONMENT');
  console.log('  Description: Controls which environment gets deployed to production');
  console.log('  Default: production-minimal');
  console.log('  Options: production-minimal, production-lead, production-full\n');
  
  console.log('How to change production environment:');
  console.log('1. Go to GitHub repository settings');
  console.log('2. Navigate to Secrets and variables → Actions → Variables');
  console.log('3. Edit PRODUCTION_ENVIRONMENT variable');
  console.log('4. Set to desired environment (production-minimal, production-lead, production-full)');
  console.log('5. Next push to main branch will use new configuration\n');
}

function showManualDeploymentGuide() {
  console.log('\n🚀 Manual Deployment Guide\n');
  console.log('You can deploy to any environment manually using GitHub Actions:\n');
  
  console.log('Steps:');
  console.log('1. Go to GitHub → Your Repository → Actions');
  console.log('2. Click "CI/CD Pipeline" workflow');
  console.log('3. Click "Run workflow" button');
  console.log('4. Select options:');
  console.log('   - Environment: testing, production-minimal, production-lead, production-full');
  console.log('   - Deploy to Vercel: true');
  console.log('5. Click "Run workflow"\n');
  
  console.log('Environment Options:');
  console.log('• testing → Uses testing database, lead management features enabled');
  console.log('• production-minimal → Uses production database, only core features');
  console.log('• production-lead → Uses production database, core + lead management');
  console.log('• production-full → Uses production database, all features enabled\n');
}

function showAutomaticDeploymentGuide() {
  console.log('\n⚡ Automatic Deployment Guide\n');
  
  console.log('Branch-based deployments:');
  console.log('• Push to develop → Deploys to testing environment with testing database');
  console.log('• Push to main → Deploys to production environment with production database\n');
  
  console.log('Production environment is controlled by PRODUCTION_ENVIRONMENT variable:');
  console.log('• Current setting determines which features are enabled in production');
  console.log('• Change the variable to switch between minimal, lead, or full production\n');
}

function showDatabaseSetupGuide() {
  console.log('\n🗄️  Database Setup Summary\n');
  
  console.log('Required Supabase Projects:');
  console.log('1. Testing Database (dental-lab-testing)');
  console.log('   - Used for: development, testing, staging');
  console.log('   - Safe for experiments and testing new features\n');
  
  console.log('2. Production Database (dental-lab-production)');
  console.log('   - Used for: live application');
  console.log('   - Contains real user data\n');
  
  console.log('Setup Steps:');
  console.log('1. Create both Supabase projects');
  console.log('2. Copy your existing schema to both databases');
  console.log('3. Get URL and anon key from each project');
  console.log('4. Add credentials to GitHub secrets');
  console.log('5. Test deployments\n');
  
  console.log('See DATABASE_SETUP_GUIDE.md for detailed instructions.');
}

function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log('\n🎛️  GitHub Control System\n');
    console.log('Usage: node scripts/github-control.js <command>\n');
    console.log('Commands:');
    console.log('  environments  - Show available production environments');
    console.log('  secrets      - Show required GitHub secrets setup');
    console.log('  variables    - Show GitHub variables setup');
    console.log('  manual       - Show manual deployment guide');
    console.log('  automatic    - Show automatic deployment guide');
    console.log('  database     - Show database setup summary');
    console.log('  all          - Show all guides\n');
    return;
  }
  
  switch (command) {
    case 'environments':
      showEnvironmentOptions();
      break;
    case 'secrets':
      generateGitHubSecretsGuide();
      break;
    case 'variables':
      generateGitHubVariablesGuide();
      break;
    case 'manual':
      showManualDeploymentGuide();
      break;
    case 'automatic':
      showAutomaticDeploymentGuide();
      break;
    case 'database':
      showDatabaseSetupGuide();
      break;
    case 'all':
      showEnvironmentOptions();
      generateGitHubSecretsGuide();
      generateGitHubVariablesGuide();
      showManualDeploymentGuide();
      showAutomaticDeploymentGuide();
      showDatabaseSetupGuide();
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Available commands: environments, secrets, variables, manual, automatic, database, all');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  showEnvironmentOptions,
  generateGitHubSecretsGuide,
  generateGitHubVariablesGuide,
  showManualDeploymentGuide,
  showAutomaticDeploymentGuide,
  showDatabaseSetupGuide
};
