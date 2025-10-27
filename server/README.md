# Server Component (PC 3)

Local Node.js server that manages the entire F1 Racing Simulator system. Runs on PC 3 (host computer) and coordinates all rig clients, processes F1 telemetry, and serves the dashboard.

## Features

- **Express.js REST API** for race control and data access
- **WebSocket server (Socket.io)** for real-time communication with rigs and dashboard
- **UDP telemetry listener** for F1 25 game data (port 20777)
- **Real-time dashboard** showing live leaderboard and telemetry
- **Race data management** with in-memory storage and history
- **State machine** managing ATTRACT → RACING → RESULTS flow
- **Stream Deck integration** via REST API endpoints

## Installation

```bash
cd server
npm install
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Server Configuration
PORT=3000
UDP_PORT=20777

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=*

# Heroku App URL (for integration)
HEROKU_APP_URL=https://my-racing-app.herokuapp.com
```

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

## Production

Build and start:

```bash
npm run build
npm start
```

## Directory Structure

```
server/
├── src/
│   ├── index.ts              # Main server file
│   ├── logger.ts             # Winston logger setup
│   ├── types.ts              # TypeScript type definitions
│   └── telemetry/
│       ├── parser.ts         # F1 UDP packet parser
│       └── types.ts          # F1 telemetry types
├── public/                   # Dashboard static files
│   ├── index.html           # Dashboard HTML
│   ├── styles.css           # Dashboard styles
│   └── dashboard.js         # Dashboard WebSocket client
├── logs/                    # Log files (created at runtime)
├── package.json
└── tsconfig.json
```

## API Endpoints

### Race Control

**POST /api/start-race**

Starts a race session. Validates that at least one player is registered.

Response:
```json
{
  "success": true,
  "state": "RACING",
  "race": {
    "sessionId": "1234567890",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "players": [
      {
        "rigId": "rig-1",
        "name": "John Doe",
        "lapTimes": []
      }
    ],
    "raceCompleted": false
  }
}
```

**POST /api/end-race**

Ends the current race, calculates results, and determines winner.

Response:
```json
{
  "success": true,
  "state": "RESULTS",
  "race": {
    "sessionId": "1234567890",
    "winner": "John Doe",
    "players": [
      {
        "rigId": "rig-1",
        "name": "John Doe",
        "finalPosition": 1,
        "fastestLap": 95432,
        "totalTime": 285123,
        "lapTimes": [95432, 94876, 94815]
      }
    ],
    "raceCompleted": true
  }
}
```

**POST /api/reset**

Resets the system to ATTRACT state, clearing all registrations.

Response:
```json
{
  "success": true,
  "state": "ATTRACT"
}
```

### Player Management

**POST /api/register**

Registers a player for a specific rig. Called by Heroku app.

Request:
```json
{
  "rig": "1",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "rig": "rig-1",
  "name": "John Doe"
}
```

### Status & Data

**GET /api/status**

Get current system status and connections.

Response:
```json
{
  "state": "RACING",
  "connections": {
    "rig-1": {
      "connected": true,
      "playerName": "John Doe",
      "lastSeen": "2024-01-01T12:00:00.000Z"
    },
    "rig-2": {
      "connected": false,
      "playerName": null,
      "lastSeen": "2024-01-01T11:55:00.000Z"
    }
  },
  "currentRace": { /* race data */ },
  "sessionId": "1234567890"
}
```

**GET /api/race-results**

Get results from the current/last race.

**GET /api/race-history**

Get all race history (all completed races).

**GET /api/health**

Health check endpoint.

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "state": "ATTRACT",
  "connections": { /* ... */ }
}
```

**POST /api/salesforce-webhook**

Endpoint for Salesforce integration. Returns race data for a specific session or current race.

Request:
```json
{
  "raceId": "1234567890"  // optional
}
```

## WebSocket Events

### Client → Server

**rig:register**

Rig client registers with the server.

Payload:
```javascript
{
  rigId: "rig-1"
}
```

**dashboard:register**

Dashboard registers to receive updates.

**heartbeat**

Keep-alive ping from rig clients.

Payload:
```javascript
{
  rigId: "rig-1",
  timestamp: 1234567890
}
```

### Server → Clients

**state:change**

System state has changed.

Payload:
```javascript
{
  state: "RACING",  // ATTRACT, RACING, or RESULTS
  playerName: "John Doe"  // optional
}
```

**command:start_race**

Broadcast to all rigs to start race.

**command:end_race**

Broadcast to all rigs to end race.

Payload:
```javascript
{
  raceData: { /* complete race results */ }
}
```

**command:reset**

Broadcast to all rigs to reset.

**rig:status**

Connection status of all rigs.

Payload:
```javascript
{
  "rig-1": {
    connected: true,
    playerName: "John Doe",
    lastSeen: "2024-01-01T12:00:00.000Z"
  },
  "rig-2": {
    connected: false,
    playerName: null,
    lastSeen: "2024-01-01T11:55:00.000Z"
  }
}
```

**telemetry:update**

Live telemetry data from F1 game.

Payload:
```javascript
{
  liveTelemetry: [
    {
      rigId: "rig-1",
      position: 1,
      currentLap: 3,
      lastLapTime: 95432,
      speed: 287,
      gap: 0,
      deltaToLeader: 0
    }
  ],
  timestamp: 1234567890
}
```

**race:data**

Full race data update.

**race:completed**

Race has been completed with final results.

**player:registered**

A player has registered for a rig.

Payload:
```javascript
{
  rigId: "rig-1",
  name: "John Doe"
}
```

## F1 Telemetry

The server listens for UDP packets from F1 25 on port 20777.

### Supported Packet Types

- **Session Data (1)** - Track info, session type, weather
- **Lap Data (2)** - Lap times, positions, sector times
- **Participants (4)** - Driver names and car numbers
- **Car Telemetry (6)** - Speed, throttle, brake, RPM, temperatures

### Configuration in F1 25

1. Settings → Telemetry Settings
2. Enable UDP Telemetry
3. Set IP Address to PC 3's local IP (e.g., 192.168.1.100)
4. Set Port to 20777
5. Set Send Rate to 60Hz (recommended)

### Telemetry Data Flow

```
F1 25 (PC 1/2) → UDP (20777) → Server (PC 3) → WebSocket → Dashboard
```

## Dashboard

Access the dashboard at: `http://localhost:3000`

### Features

- **Real-time leaderboard** with positions and names
- **Live telemetry cards** for each rig
  - Current position
  - Current lap number
  - Last lap time
  - Speed (km/h)
  - Gap to car in front
- **Race information**
  - Session ID
  - Race duration
  - Fastest lap
- **Connection status** for both rigs
- **System state indicator** (ATTRACT, RACING, RESULTS)

### Dashboard Controls

The dashboard is view-only. Use Stream Deck or API calls to control the system.

## Logging

Logs are written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Log level can be set via `LOG_LEVEL` environment variable:
- `error` - Errors only
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All logs including debug info

## State Machine

```
ATTRACT
  ↓ (player registers)
  ↓
ATTRACT (waiting for more players or start)
  ↓ (start race API call)
  ↓
RACING
  ↓ (end race API call)
  ↓
RESULTS
  ↓ (reset API call)
  ↓
ATTRACT
```

### State Transitions

- **ATTRACT → RACING:** `POST /api/start-race` (requires at least one player)
- **RACING → RESULTS:** `POST /api/end-race`
- **RESULTS → ATTRACT:** `POST /api/reset`
- **Any → ATTRACT:** `POST /api/reset` (emergency reset)

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `404` - Not found (e.g., no race data)
- `500` - Internal server error

Error response format:
```json
{
  "error": "Error message",
  "message": "Detailed description"
}
```

## Performance Considerations

- Telemetry is broadcast at the rate received from F1 (up to 60Hz)
- WebSocket connections are kept alive with automatic reconnection
- Race data is stored in memory (consider Redis for production at scale)
- Dashboard updates are throttled to prevent overwhelming clients

## Troubleshooting

### No telemetry data

1. Check F1 25 UDP settings
2. Verify game is running
3. Check firewall allows UDP 20777
4. Review server logs for UDP errors

### Rigs not connecting

1. Verify rig-client configuration (SERVER_URL)
2. Check network connectivity
3. Review firewall settings (allow TCP 3000)
4. Check server logs for connection errors

### Dashboard not updating

1. Check WebSocket connection (green indicator)
2. Verify browser console for errors
3. Hard refresh browser (Ctrl+Shift+R)
4. Check server logs

### API calls failing

1. Test with curl: `curl -X POST http://localhost:3000/api/status`
2. Check server is running
3. Review server logs
4. Verify request format

## Development Tips

- Use `LOG_LEVEL=debug` for detailed logging
- Monitor server logs in real-time: `tail -f logs/combined.log`
- Use browser DevTools for dashboard debugging
- Test API endpoints with Postman or curl
- Use `npm run type-check` to verify TypeScript types

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set production environment variables

3. Start with process manager:
```bash
# Using PM2
pm2 start dist/index.js --name "f1-server"
pm2 save
pm2 startup

# Or use systemd on Linux
# Create /etc/systemd/system/f1-server.service
```

4. Configure reverse proxy (optional):
```nginx
# Nginx example
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## License

MIT
