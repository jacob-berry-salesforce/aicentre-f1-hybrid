/**
 * Windows Service Uninstaller for Rig Client
 * Run this script with administrator privileges on Windows
 */

import { loadConfig } from './config';

async function uninstallService() {
  const config = loadConfig();

  try {
    // Dynamic import to avoid errors on non-Windows platforms
    const { Service } = await import('node-windows');

    const svc = new Service({
      name: `F1 Rig Client - ${config.rigId}`,
      script: '' // Not needed for uninstall
    });

    svc.on('uninstall', () => {
      console.log(`Service uninstalled successfully: ${config.rigId}`);
    });

    svc.on('error', (err: Error) => {
      console.error('Service error:', err);
    });

    console.log(`Uninstalling Windows service for ${config.rigId}...`);
    console.log('This requires administrator privileges.');
    svc.uninstall();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      console.error('node-windows module not found. This script only works on Windows.');
      process.exit(1);
    } else {
      console.error('Error uninstalling service:', error);
      process.exit(1);
    }
  }
}

uninstallService().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
