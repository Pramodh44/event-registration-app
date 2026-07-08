// Load environment variables from .env.local
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

// Run seed script using ts-node compiler registration
require('ts-node').register({
  compilerOptions: {
    module: 'commonjs',
    target: 'es2017'
  }
});

// Import and run seed
require('./seed.ts');
