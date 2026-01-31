#!/usr/bin/env node
/**
 * TrustShield Startup Script
 * Runs both backend and frontend servers together
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log(`
╔════════════════════════════════════════════╗
║  🛡️  TrustShield - Starting All Services  ║
╚════════════════════════════════════════════╝
`);

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// Start Backend
console.log('📦 Starting Backend (port 5000)...');
const backend = spawn('npm', ['start'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: isWindows
});

// Wait 3 seconds then start frontend
setTimeout(() => {
  console.log('\n📦 Starting Frontend (port 3000)...\n');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: isWindows
  });

  frontend.on('error', (err) => {
    console.error('Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('Backend error:', err);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down servers...');
  backend.kill();
  process.exit(0);
});
