#!/usr/bin/env node

/**
 * Deployment Setup Script
 * Helps configure environment variables for different deployment modes
 */

const fs = require('fs');
const path = require('path');

const DEPLOYMENT_MODES = {
  minimal: {
    name: 'Minimal Production',
    description: 'Only core features (Dashboard, Patients, Settings)',
    envFile: '.env.production.minimal'
  },
  leadmanagement: {
    name: 'Lead Management',
    description: 'Core + Lead management features',
    envFile: '.env.production.leadmanagement'
  },
  full: {
    name: 'Full Production',
    description: 'All features enabled',
    envFile: '.env.production'
  }
};

function displayModes() {
  console.log('\n🚀 Dental Lab Management - Deployment Setup\n');
  console.log('Available deployment modes:\n');
  
  Object.entries(DEPLOYMENT_MODES).forEach(([key, mode], index) => {
    console.log(`${index + 1}. ${mode.name}`);
    console.log(`   ${mode.description}`);
    console.log(`   Environment file: ${mode.envFile}\n`);
  });
}

function generateVercelEnvCommands(mode) {
  const envFile = path.join(__dirname, '..', DEPLOYMENT_MODES[mode].envFile);
  
  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file ${envFile} not found!`);
    return;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envLines = envContent.split('\n').filter(line => 
    line.trim() && !line.startsWith('#') && line.includes('=')
  );
  
  console.log(`\n📋 Vercel Environment Variables for ${DEPLOYMENT_MODES[mode].name}:\n`);
  console.log('Copy and paste these commands in your terminal:\n');
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    console.log(`vercel env add ${key} production`);
    console.log(`# Enter value: ${value}\n`);
  });
  
  console.log('\nOr add them manually in Vercel Dashboard:');
  console.log('https://vercel.com/dashboard → Your Project → Settings → Environment Variables\n');
  
  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    console.log(`${key} = ${value}`);
  });
}

function generateGitHubSecrets() {
  console.log('\n🔐 Required GitHub Secrets:\n');
  console.log('Add these secrets to your GitHub repository:');
  console.log('GitHub → Your Repo → Settings → Secrets and variables → Actions\n');
  
  const secrets = [
    {
      name: 'VERCEL_TOKEN',
      description: 'Get from https://vercel.com/account/tokens',
      value: 'your_vercel_token_here'
    },
    {
      name: 'VERCEL_ORG_ID',
      description: 'Get from Vercel project settings',
      value: 'your_vercel_org_id_here'
    },
    {
      name: 'VERCEL_PROJECT_ID',
      description: 'Get from Vercel project settings',
      value: 'your_vercel_project_id_here'
    }
  ];
  
  secrets.forEach(secret => {
    console.log(`${secret.name}`);
    console.log(`  Description: ${secret.description}`);
    console.log(`  Value: ${secret.value}\n`);
  });
}

function showTestingCommands() {
  console.log('\n🧪 Testing Commands:\n');
  
  const commands = [
    {
      command: 'npm install',
      description: 'Install all dependencies including testing tools'
    },
    {
      command: 'npm run test',
      description: 'Run unit tests in watch mode'
    },
    {
      command: 'npm run test:run',
      description: 'Run unit tests once'
    },
    {
      command: 'npm run test:coverage',
      description: 'Run tests with coverage report'
    },
    {
      command: 'npm run test:e2e',
      description: 'Run end-to-end tests'
    },
    {
      command: 'npm run build',
      description: 'Build for production'
    },
    {
      command: 'npm run preview',
      description: 'Preview production build locally'
    }
  ];
  
  commands.forEach(cmd => {
    console.log(`${cmd.command}`);
    console.log(`  ${cmd.description}\n`);
  });
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    displayModes();
    console.log('Usage:');
    console.log('  node scripts/setup-deployment.js <mode>');
    console.log('  node scripts/setup-deployment.js secrets');
    console.log('  node scripts/setup-deployment.js test');
    console.log('\nExamples:');
    console.log('  node scripts/setup-deployment.js minimal');
    console.log('  node scripts/setup-deployment.js leadmanagement');
    console.log('  node scripts/setup-deployment.js full');
    console.log('  node scripts/setup-deployment.js secrets');
    console.log('  node scripts/setup-deployment.js test');
    return;
  }
  
  if (command === 'secrets') {
    generateGitHubSecrets();
    return;
  }
  
  if (command === 'test') {
    showTestingCommands();
    return;
  }
  
  if (!DEPLOYMENT_MODES[command]) {
    console.error(`❌ Unknown deployment mode: ${command}`);
    console.log('Available modes: minimal, leadmanagement, full');
    return;
  }
  
  generateVercelEnvCommands(command);
}

if (require.main === module) {
  main();
}

module.exports = {
  DEPLOYMENT_MODES,
  generateVercelEnvCommands,
  generateGitHubSecrets,
  showTestingCommands
};
