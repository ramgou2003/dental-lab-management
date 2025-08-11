#!/usr/bin/env node

/**
 * Load Environment Configuration Script
 * Loads feature flags and database settings from environments.json
 * Used by GitHub Actions to configure deployments
 */

const fs = require('fs');
const path = require('path');

function loadEnvironmentConfig(environmentName) {
  const configPath = path.join(__dirname, '..', 'config', 'environments.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ Environment configuration file not found:', configPath);
    process.exit(1);
  }
  
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  if (!config.environments[environmentName]) {
    console.error(`❌ Environment '${environmentName}' not found in configuration`);
    console.error('Available environments:', Object.keys(config.environments).join(', '));
    process.exit(1);
  }
  
  const environment = config.environments[environmentName];
  
  // Output environment variables for GitHub Actions
  Object.entries(environment.features).forEach(([key, value]) => {
    console.log(`${key}=${value}`);
  });
  
  // Output database configuration info (for logging)
  const dbConfig = config.databases[environment.database];
  console.error(`ℹ️  Using database: ${dbConfig.name}`);
  console.error(`ℹ️  Environment: ${environment.name}`);
  console.error(`ℹ️  Description: ${environment.description}`);
}

function main() {
  const environmentName = process.argv[2];
  
  if (!environmentName) {
    console.error('Usage: node scripts/load-environment.js <environment-name>');
    console.error('');
    console.error('Available environments:');
    
    const configPath = path.join(__dirname, '..', 'config', 'environments.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      Object.entries(config.environments).forEach(([key, env]) => {
        console.error(`  ${key}: ${env.description}`);
      });
    }
    
    process.exit(1);
  }
  
  loadEnvironmentConfig(environmentName);
}

if (require.main === module) {
  main();
}

module.exports = { loadEnvironmentConfig };
