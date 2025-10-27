/**
 * Windows Service Installer for Rig Client
 * Run this script with administrator privileges on Windows
 */

import path from 'path';
import { loadConfig } from './config';

// Note: node-windows is only available on Windows
// This script will gracefully handle non-Windows environments

async function installService() {
  const config = loadConfig();

  try {
    // Dynamic import to avoid errors on non-Windows platforms
    const { Service } = await import('node-windows');

    const svc = new Service({
      name: `F1 Rig Client - ${config.rigId}`,
      description: `F1 Racing Simulator Rig Client for ${config.rigId}`,
      script: path.join(__dirname, 'index.js'),
      nodeOptions: ['--max-old-space-size=4096'],
      env: [
        {
          name: 'NODE_ENV',
          value: 'production'
        },
        {
          name: 'RIG_ID',
          value: config.rigId
        },
        {
          name: 'SERVER_URL',
          value: config.serverUrl
        }
      ]
    });

    svc.on('install', () => {
      console.log(`Service installed successfully: ${config.rigId}`);
      console.log('Starting service...');
      svc.start();
    });

    svc.on('start', () => {
      console.log('Service started successfully');
      console.log(`Rig client is now running as a Windows service`);
    });

    svc.on('error', (err: Error) => {
      console.error('Service error:', err);
    });

    console.log(`Installing Windows service for ${config.rigId}...`);
    console.log('This requires administrator privileges.');
    svc.install();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      console.error('node-windows module not found. This script only works on Windows.');
      console.error('On other platforms, use PM2 or similar process managers.');
      process.exit(1);
    } else {
      console.error('Error installing service:', error);
      process.exit(1);
    }
  }
}

installService().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
