import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 5000;
const PC3_SERVER_URL = process.env.PC3_SERVER_URL || 'http://localhost:3000';
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

// Connection to PC 3 server
let pc3Socket: ClientSocket | null = null;

function connectToPC3() {
  console.log(`Connecting to PC 3 server: ${PC3_SERVER_URL}`);

  pc3Socket = ioClient(PC3_SERVER_URL, {
    reconnection: true,
    reconnectionDelay: 5000,
    reconnectionAttempts: Infinity
  });

  pc3Socket.on('connect', () => {
    console.log('Connected to PC 3 server');
  });

  pc3Socket.on('disconnect', () => {
    console.warn('Disconnected from PC 3 server');
  });

  pc3Socket.on('connect_error', (error) => {
    console.error('PC 3 connection error:', error.message);
  });

  // Forward state changes to connected clients
  pc3Socket.on('state:change', (data) => {
    io.emit('state:change', data);
  });

  pc3Socket.on('race:completed', (data) => {
    io.emit('race:completed', data);
  });
}

// Connect to PC 3 if URL is configured
if (PC3_SERVER_URL && PC3_SERVER_URL !== 'http://localhost:3000') {
  connectToPC3();
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    pc3Connected: pc3Socket?.connected || false
  });
});

// Player registration
app.post('/api/register', async (req, res) => {
  try {
    const { rig, name } = req.body;

    if (!rig || !name) {
      return res.status(400).json({ error: 'Missing rig or name' });
    }

    console.log(`Registration request: ${name} on rig ${rig}`);

    // Forward to PC 3 server
    const response = await axios.post(`${PC3_SERVER_URL}/api/register`, {
      rig,
      name
    });

    // Emit to connected clients
    io.emit('player:registered', { rig, name });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register player',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get race results
app.get('/api/race-results', async (req, res) => {
  try {
    const response = await axios.get(`${PC3_SERVER_URL}/api/race-results`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching race results:', error);
    res.status(500).json({
      error: 'Failed to fetch race results',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  socket.on('request:race_results', async () => {
    try {
      const response = await axios.get(`${PC3_SERVER_URL}/api/race-results`);
      socket.emit('race:results', response.data);
    } catch (error) {
      console.error('Error fetching race results:', error);
      socket.emit('error', { message: 'Failed to fetch race results' });
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Heroku app server started on port ${PORT}`);
  console.log(`App URL: ${APP_URL}`);
  console.log(`PC 3 Server: ${PC3_SERVER_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('HTTP server closed');
    if (pc3Socket) {
      pc3Socket.disconnect();
    }
    process.exit(0);
  });
});
