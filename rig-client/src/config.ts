import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export interface Config {
  rigId: string;
  serverUrl: string;
  herokuAppUrl: string;
  f1GameWindowTitle: string;
  reconnectInterval: number;
  heartbeatInterval: number;
}

export function loadConfig(): Config {
  const configPath = path.join(process.cwd(), 'config.json');
  let fileConfig: Partial<Config> = {};

  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    fileConfig = JSON.parse(configData);
  }

  return {
    rigId: fileConfig.rigId || process.env.RIG_ID || 'rig-1',
    serverUrl: fileConfig.serverUrl || process.env.SERVER_URL || 'http://localhost:3000',
    herokuAppUrl: fileConfig.herokuAppUrl || process.env.HEROKU_APP_URL || 'https://my-racing-app.herokuapp.com',
    f1GameWindowTitle: fileConfig.f1GameWindowTitle || process.env.F1_GAME_WINDOW || 'F1',
    reconnectInterval: fileConfig.reconnectInterval || parseInt(process.env.RECONNECT_INTERVAL || '5000'),
    heartbeatInterval: fileConfig.heartbeatInterval || parseInt(process.env.HEARTBEAT_INTERVAL || '30000')
  };
}

export function saveConfig(config: Config): void {
  const configPath = path.join(process.cwd(), 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}
