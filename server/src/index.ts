import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dgram from 'dgram';
import path from 'path';
import dotenv from 'dotenv';
import { logger } from './logger';
import { F1TelemetryParser } from './telemetry/parser';
import { PacketType } from './telemetry/types';
import {
  SystemState,
  RigConnection,
  RaceData,
  PlayerRaceData,
  LiveTelemetry,
  RegistrationData
} from './types';
import { getTrackInfo } from './services/openf1';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configuration
const PORT = process.env.PORT || 3000;
const UDP_PORT = parseInt(process.env.UDP_PORT || '20777');
const HEROKU_APP_URL = process.env.HEROKU_APP_URL || '';

// State management
let systemState: SystemState = SystemState.ATTRACT;
const rigConnections = new Map<string, RigConnection>();
let currentRace: RaceData | null = null;
const raceHistory: RaceData[] = [];
const telemetryParser = new F1TelemetryParser();
const liveTelemetry = new Map<string, LiveTelemetry>();
let sessionId: string = '';

// Initialize rig connections
rigConnections.set('rig-1', { rigId: 'rig-1', connected: false, lastSeen: new Date() });
rigConnections.set('rig-2', { rigId: 'rig-2', connected: false, lastSeen: new Date() });

// UDP Telemetry Listener
const udpServer = dgram.createSocket('udp4');

udpServer.on('error', (err) => {
  logger.error('UDP server error:', err);
  udpServer.close();
});

// Map source IP to rig ID (will be populated as rigs connect)
const ipToRigMap = new Map<string, string>();

udpServer.on('message', (msg, rinfo) => {
  try {
    const packet = telemetryParser.parse(msg);

    if (!packet || !packet.header) return;

    // Determine which rig this packet is from based on source IP
    const sourceIp = rinfo.address;
    let rigId = ipToRigMap.get(sourceIp);

    // If we haven't mapped this IP yet, try to infer from connected rigs
    if (!rigId) {
      // Log for debugging
      logger.debug(`Received telemetry from unknown IP: ${sourceIp}`);

      // For now, skip packets from unmapped IPs
      // They will be mapped once rigs connect and we receive their IPs
      return;
    }

    // Update session ID
    if (packet.header.sessionUID) {
      const newSessionId = packet.header.sessionUID.toString();
      if (sessionId !== newSessionId) {
        sessionId = newSessionId;
        logger.info(`New session started: ${sessionId} from ${rigId}`);
      }
    }

    // Process different packet types, passing rigId
    switch (packet.header.packetId) {
      case PacketType.LapData:
        processLapData(packet, rigId);
        break;
      case PacketType.CarTelemetry:
        processCarTelemetry(packet, rigId);
        break;
      case PacketType.Participants:
        processParticipants(packet, rigId);
        break;
      case PacketType.Session:
        processSessionData(packet, rigId);
        break;
    }

    // Broadcast telemetry to dashboard
    io.to('dashboard').emit('telemetry:update', {
      liveTelemetry: Array.from(liveTelemetry.values()),
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('Error processing UDP packet:', error);
  }
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  logger.info(`UDP telemetry server listening on ${address.address}:${address.port}`);
});

function processLapData(packet: any, rigId: string) {
  if (!packet.lapData || !currentRace) return;

  const playerCarIndex = packet.header.playerCarIndex;
  const lapData = packet.lapData[playerCarIndex];

  if (lapData) {
    liveTelemetry.set(rigId, {
      rigId,
      position: lapData.carPosition,
      currentLap: lapData.currentLapNum,
      lastLapTime: lapData.lastLapTimeInMS > 0 ? lapData.lastLapTimeInMS : undefined,
      speed: 0, // Will be updated from telemetry packet
      gap: lapData.deltaToCarInFrontInMS > 0 ? lapData.deltaToCarInFrontInMS : undefined,
      deltaToLeader: lapData.deltaToRaceLeaderInMS
    });

    // Store lap time if lap completed
    if (lapData.lastLapTimeInMS > 0) {
      const player = currentRace.players.find(p => p.rigId === rigId);
      if (player && !player.lapTimes.includes(lapData.lastLapTimeInMS)) {
        player.lapTimes.push(lapData.lastLapTimeInMS);
        logger.info(`${rigId} completed lap: ${(lapData.lastLapTimeInMS / 1000).toFixed(3)}s`);
      }
    }
  }
}

function processCarTelemetry(packet: any, rigId: string) {
  if (!packet.carTelemetryData) return;

  const playerCarIndex = packet.header.playerCarIndex;
  const telemetry = packet.carTelemetryData[playerCarIndex];

  if (telemetry) {
    const existing = liveTelemetry.get(rigId);

    if (existing) {
      existing.speed = telemetry.speed;
      liveTelemetry.set(rigId, existing);
    }
  }
}

function processParticipants(packet: any, rigId: string) {
  if (!packet.participants) return;
  // Store participant data for reference
  logger.debug(`Participants data received from ${rigId}`);
}

function processSessionData(packet: any, rigId: string) {
  logger.debug(`Session data received from ${rigId}`, {
    trackId: packet.trackId,
    sessionType: packet.sessionType
  });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('rig:register', (data: { rigId: string; ipAddress?: string }) => {
    const { rigId, ipAddress } = data;

    if (rigConnections.has(rigId)) {
      const rig = rigConnections.get(rigId)!;
      rig.connected = true;
      rig.lastSeen = new Date();
      rigConnections.set(rigId, rig);

      socket.join('rigs');
      socket.data.rigId = rigId;

      // Map the rig's IP address to its rigId for UDP telemetry routing
      if (ipAddress) {
        ipToRigMap.set(ipAddress, rigId);
        logger.info(`Rig registered: ${rigId} with IP ${ipAddress}`);
      } else {
        // Fallback: use socket's remote address
        const socketIp = socket.handshake.address;
        if (socketIp) {
          ipToRigMap.set(socketIp, rigId);
          logger.info(`Rig registered: ${rigId} with IP ${socketIp} (from socket)`);
        } else {
          logger.warn(`Rig registered: ${rigId} but no IP address available`);
        }
      }

      // Send current state to newly connected rig
      socket.emit('state:change', {
        state: systemState,
        playerName: rig.playerName
      });

      // Broadcast connection status to dashboard
      io.to('dashboard').emit('rig:status', getConnectionStatus());
    } else {
      logger.warn(`Unknown rig tried to register: ${rigId}`);
    }
  });

  socket.on('dashboard:register', () => {
    socket.join('dashboard');
    logger.info('Dashboard registered');

    // Send current state
    socket.emit('state:change', { state: systemState });
    socket.emit('rig:status', getConnectionStatus());

    if (currentRace) {
      socket.emit('race:data', currentRace);
    }
  });

  socket.on('disconnect', () => {
    const rigId = socket.data.rigId;
    if (rigId && rigConnections.has(rigId)) {
      const rig = rigConnections.get(rigId)!;
      rig.connected = false;
      rigConnections.set(rigId, rig);

      logger.info(`Rig disconnected: ${rigId}`);
      io.to('dashboard').emit('rig:status', getConnectionStatus());
    }
  });

  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

// REST API Endpoints

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    state: systemState,
    connections: getConnectionStatus()
  });
});

// Configuration endpoint (for QR code generation)
app.get('/api/config', (req, res) => {
  res.json({
    herokuAppUrl: HEROKU_APP_URL
  });
});

// Get system status
app.get('/api/status', (req, res) => {
  res.json({
    state: systemState,
    connections: getConnectionStatus(),
    currentRace: currentRace,
    sessionId
  });
});

// Start race
app.post('/api/start-race', (req, res) => {
  try {
    logger.info('START_RACE command received');

    // Initialize race data
    const players: PlayerRaceData[] = [];
    rigConnections.forEach((rig) => {
      if (rig.playerName) {
        players.push({
          rigId: rig.rigId,
          name: rig.playerName,
          lapTimes: []
        });
      }
    });

    if (players.length === 0) {
      return res.status(400).json({
        error: 'No players registered',
        message: 'At least one player must register before starting a race'
      });
    }

    currentRace = {
      sessionId: sessionId || Date.now().toString(),
      timestamp: new Date(),
      players,
      raceCompleted: false
    };

    systemState = SystemState.RACING;
    liveTelemetry.clear();

    // Broadcast to all rigs
    io.to('rigs').emit('command:start_race');
    io.to('dashboard').emit('state:change', { state: systemState });
    io.to('dashboard').emit('race:data', currentRace);

    logger.info('Race started', { players: players.map(p => p.name) });

    res.json({
      success: true,
      state: systemState,
      race: currentRace
    });
  } catch (error) {
    logger.error('Error starting race:', error);
    res.status(500).json({ error: 'Failed to start race' });
  }
});

// End race
app.post('/api/end-race', (req, res) => {
  try {
    logger.info('END_RACE command received');

    if (!currentRace) {
      return res.status(400).json({ error: 'No active race' });
    }

    // Finalize race data
    currentRace.raceCompleted = true;

    // Calculate final positions and stats
    currentRace.players.forEach((player) => {
      const telemetry = liveTelemetry.get(player.rigId);
      if (telemetry) {
        player.finalPosition = telemetry.position;
      }

      if (player.lapTimes.length > 0) {
        player.fastestLap = Math.min(...player.lapTimes);
        player.totalTime = player.lapTimes.reduce((a, b) => a + b, 0);
      }
    });

    // Determine winner
    currentRace.players.sort((a, b) => {
      if (a.finalPosition && b.finalPosition) {
        return a.finalPosition - b.finalPosition;
      }
      return 0;
    });

    if (currentRace.players.length > 0 && currentRace.players[0]) {
      currentRace.winner = currentRace.players[0].name;
    }

    // Save to history
    raceHistory.push({ ...currentRace });

    systemState = SystemState.RESULTS;

    // Broadcast to all rigs
    io.to('rigs').emit('command:end_race', { raceData: currentRace });
    io.to('dashboard').emit('state:change', { state: systemState });
    io.to('dashboard').emit('race:completed', currentRace);

    logger.info('Race ended', {
      winner: currentRace.winner,
      players: currentRace.players.length
    });

    res.json({
      success: true,
      state: systemState,
      race: currentRace
    });
  } catch (error) {
    logger.error('Error ending race:', error);
    res.status(500).json({ error: 'Failed to end race' });
  }
});

// Reset system
app.post('/api/reset', (req, res) => {
  try {
    logger.info('RESET command received');

    systemState = SystemState.ATTRACT;
    currentRace = null;
    liveTelemetry.clear();

    // Clear player names but keep connections
    rigConnections.forEach((rig, rigId) => {
      rig.playerName = undefined;
      rigConnections.set(rigId, rig);
    });

    // Broadcast to all rigs
    io.to('rigs').emit('command:reset');
    io.to('dashboard').emit('state:change', { state: systemState });
    io.to('dashboard').emit('rig:status', getConnectionStatus());

    logger.info('System reset to ATTRACT state');

    res.json({
      success: true,
      state: systemState
    });
  } catch (error) {
    logger.error('Error resetting system:', error);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

// Player registration (called from Heroku app)
app.post('/api/register', (req, res) => {
  try {
    const { rig, name } = req.body as RegistrationData;

    if (!rig || !name) {
      return res.status(400).json({ error: 'Missing rig or name' });
    }

    const rigId = `rig-${rig}`;

    if (!rigConnections.has(rigId)) {
      return res.status(400).json({ error: 'Invalid rig ID' });
    }

    const rigConnection = rigConnections.get(rigId)!;
    rigConnection.playerName = name;
    rigConnections.set(rigId, rigConnection);

    logger.info(`Player registered: ${name} on ${rigId}`);

    // Notify the specific rig
    io.to('rigs').emit('player:registered', { rigId, name });
    io.to('dashboard').emit('rig:status', getConnectionStatus());

    res.json({
      success: true,
      rig: rigId,
      name
    });
  } catch (error) {
    logger.error('Error registering player:', error);
    res.status(500).json({ error: 'Failed to register player' });
  }
});

// Get race results
app.get('/api/race-results', (req, res) => {
  if (!currentRace) {
    return res.status(404).json({ error: 'No race data available' });
  }

  res.json(currentRace);
});

// Get race history
app.get('/api/race-history', (req, res) => {
  res.json(raceHistory);
});

// Get track information from OpenF1
app.get('/api/track-info', async (req, res) => {
  try {
    logger.info('Track info requested');
    const trackInfo = await getTrackInfo();

    if (!trackInfo) {
      return res.status(404).json({ error: 'Track information not available' });
    }

    res.json(trackInfo);
  } catch (error) {
    logger.error('Error fetching track info:', error);
    res.status(500).json({ error: 'Failed to fetch track information' });
  }
});

// Salesforce webhook endpoint
app.post('/api/salesforce-webhook', (req, res) => {
  try {
    const { raceId } = req.body;

    let race = currentRace;
    if (raceId) {
      race = raceHistory.find(r => r.sessionId === raceId) || null;
    }

    if (!race) {
      return res.status(404).json({ error: 'Race not found' });
    }

    logger.info('Salesforce webhook called', { raceId: race.sessionId });

    res.json({
      success: true,
      data: race
    });
  } catch (error) {
    logger.error('Error processing Salesforce webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Helper function
function getConnectionStatus() {
  const status: any = {};
  rigConnections.forEach((rig, rigId) => {
    status[rigId] = {
      connected: rig.connected,
      playerName: rig.playerName,
      lastSeen: rig.lastSeen
    };
  });
  return status;
}

// Start servers
udpServer.bind(UDP_PORT);

httpServer.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Dashboard available at http://localhost:${PORT}`);
  logger.info(`System state: ${systemState}`);

  if (HEROKU_APP_URL) {
    logger.info(`Heroku app URL: ${HEROKU_APP_URL}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    udpServer.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    udpServer.close();
    process.exit(0);
  });
});
